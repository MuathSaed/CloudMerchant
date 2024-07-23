import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import asyncStorage, { Keys } from "@utils/asyncStorage";
import { fetchDataAsync } from "app/api/fetchDataAsync";
import { useDispatch, useSelector } from "react-redux";
import { getAuthState, updateAuthState } from "app/store/auth";

let client = axios.create({ baseURL: "https://cloud-merchant-gp1.ew.r.appspot.com" });

export type TokenResponse = {
  tokens: {
    refresh: string;
    access: string;
  };
  profile: {
    id: string;
    name: string;
    email: string;
    role: string;
    verified: boolean;
    avatar?: string;
    address?: string;
    city?: string;
    location?: { latitude: number; longitude: number };
    notificationToken?: string;
  };
};

let useClient = () => {
  let authState = useSelector(getAuthState);
  let dispatch = useDispatch();

  let token = authState.profile?.accessToken;
  client.interceptors.request.use(
    (config) => {
      if (!config.headers.Authorization) {
        config.headers.Authorization = "Bearer " + token;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  let refreshAuthLogic = async (failedRequest: any) => {
    let refreshToken = await asyncStorage.get(Keys.REFRESH_TOKEN);
    let options = {
      method: "POST",
      data: { refreshToken },
      url: "https://cloud-merchant-gp1.ew.r.appspot.com/auth/refresh-token",
    };

    let res = await fetchDataAsync<TokenResponse>(axios(options));
    if (res?.tokens) {
      failedRequest.response.config.headers.Authorization =
        "Bearer " + res.tokens.access;

      if (failedRequest.response.config.url === "/auth/sign-out") {
        failedRequest.response.config.data = {
          refreshToken: res.tokens.refresh,
        };
      }

      await asyncStorage.save(Keys.AUTH_TOKEN, res.tokens.access);
      await asyncStorage.save(Keys.REFRESH_TOKEN, res.tokens.refresh);

      dispatch(
        updateAuthState({
          profile: { ...res.profile, accessToken: res.tokens.access },
          pending: false,
        })
      );
      return Promise.resolve();
    }
  };

  createAuthRefreshInterceptor(client, refreshAuthLogic);

  return { authClient: client };
};

export default useClient;
