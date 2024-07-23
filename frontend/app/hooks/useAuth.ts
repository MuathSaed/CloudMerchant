import axios from "axios";
import asyncStorage, { Keys } from "@utils/asyncStorage";
import { fetchDataAsync } from "app/api/fetchDataAsync";
import { getAuthState, updateAuthState } from "app/store/auth";
import { useDispatch, useSelector } from "react-redux";
import useClient from "./useClient";
import messaging from '@react-native-firebase/messaging';

let client = axios.create({ baseURL: "https://cloud-merchant-gp1.ew.r.appspot.com" });

export interface SignInRes {
  profile: {
    id: string;
    email: string;
    name: string;
    role: string;
    verified: boolean;
    avatar?: string;
    address?: string;
    city?: string;
    location?: { latitude: number; longitude: number };
    notificationToken?: string;
  };
  tokens: {
    refresh: string;
    access: string;
  };
}

type UserInfo = {
  email: string;
  password: string;
};

let useAuth = () => {
  let { authClient } = useClient();
  let dispatch = useDispatch();
  let authState = useSelector(getAuthState);

  let signIn = async (userInfo: UserInfo) => {
    dispatch(updateAuthState({ profile: null, pending: true }));
    let res = await fetchDataAsync<SignInRes>(
      client.post("/auth/sign-in", userInfo)
    );

    if (res) {
      await asyncStorage.save(Keys.AUTH_TOKEN, res.tokens.access);
      await asyncStorage.save(Keys.REFRESH_TOKEN, res.tokens.refresh);
      dispatch(
        updateAuthState({
          profile: { ...res.profile, accessToken: res.tokens.access },
          pending: false,
        })
      );

      
      let token = await messaging().getToken();
      console.log('FCM Token:', token);
      console.log("id:", res.profile.id);
      let res2 = await fetchDataAsync(
        client.put("/auth/fcm/" + res.profile.id, {
          notificationToken: token,
        })
      );

    } else {
      dispatch(updateAuthState({ profile: null, pending: false }));
    }
  };

  let signOut = async () => {
    let token = await asyncStorage.get(Keys.REFRESH_TOKEN);
    if (token) {
      dispatch(updateAuthState({ profile: authState.profile, pending: true }));
      await fetchDataAsync(
        authClient.post("/auth/sign-out", { refreshToken: token })
      );
      await asyncStorage.remove(Keys.REFRESH_TOKEN);
      await asyncStorage.remove(Keys.AUTH_TOKEN);
      dispatch(updateAuthState({ profile: null, pending: false }));
    }
  };

  let loggedIn = authState.profile ? true : false;

  return { signIn, signOut, authState, loggedIn };
};

export default useAuth;
