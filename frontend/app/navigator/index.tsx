import { FC, useEffect } from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import colors from "@utils/colors";
import AuthNavigator from "./AuthNavigator";
import { useDispatch } from "react-redux";
import { Profile, updateAuthState } from "app/store/auth";
import { fetchDataAsync } from "app/api/fetchDataAsync";
import useAuth from "app/hooks/useAuth";
import SellerTabNavigator from "./SellerTabNavigator";
import useClient from "app/hooks/useClient";
import asyncStorage, { Keys } from "@utils/asyncStorage";
import BuyerTabNavigator from "./BuyerTabNavigator";
import DriverTabNavigator from "./DriverTabNavigator";

let MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.white,
  },
};

export type ProfileRes = {
  profile: {
    id: string;
    name: string;
    email: string;
    role: string;
    verified: boolean;
    avatar?: string;

  };
};

interface Props {}

let Navigator: FC<Props> = (props) => {
  let dispatch = useDispatch();

  let { loggedIn, authState } = useAuth();
  let { authClient } = useClient();
  let role: string = "";
  let userId;
  let res;

  let fetchAuthState = async () => {
    let token = await asyncStorage.get(Keys.AUTH_TOKEN);
    if (token) {
      dispatch(updateAuthState({ pending: true, profile: null }));
      res = await fetchDataAsync<ProfileRes>(
        authClient.get("/auth/profile", {
          headers: {
            Authorization: "Bearer " + token,
          },
        })
      );


      if (res) {
        dispatch(
          updateAuthState({
            pending: false,
            profile: { ...res.profile, accessToken: token },
          })
        );
      } else {
        dispatch(updateAuthState({ pending: false, profile: null }));
      }
    }
  };

  useEffect(() => {
    fetchAuthState();
  }, []);

  if (authState.profile) {
    role = authState.profile.role;
    userId = authState.profile.id;
  }

  let start = () => {
    if (loggedIn && role === "Buyer") {
      return <BuyerTabNavigator />;
    } else if (loggedIn && role === "Seller") {
      return <SellerTabNavigator />;
    } else if (loggedIn && role === "Driver") {
      return <DriverTabNavigator />;
    }
    return <AuthNavigator />;
  };
  
  return (
      <NavigationContainer theme={MyTheme}>
        {start()}
      </NavigationContainer>
    );
};

let styles = StyleSheet.create({
  container: {},
});

export default Navigator;
