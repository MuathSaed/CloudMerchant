import { FC } from "react";
import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignIn from "app/screens/SignIn";
import SignUp from "app/screens/SignUp";
import ForgetPassword from "app/screens/ForgetPassword";

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgetPassword: undefined;
};

let Stack = createNativeStackNavigator<AuthStackParamList>();

interface Props {}

let AuthNavigator: FC<Props> = (props) => {
  return (
    <Stack.Navigator
      initialRouteName="SignIn"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
    </Stack.Navigator>
  );
};

let styles = StyleSheet.create({
  container: {},
});

export default AuthNavigator;
