import { FC } from "react";
import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DriverProfile from "app/screens/DriverProfile";
import EditProfile from "app/screens/EditProfile";
import { Profile } from "app/store/auth";

export type ProfileNavigatorParamList = {
  DriverProfile: undefined;
  EditProfile: { profile: Profile };
};

let Stack = createNativeStackNavigator<ProfileNavigatorParamList>();

interface Props {}

let DriverProfileNavigator: FC<Props> = (props) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DriverProfile" component={DriverProfile} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
    </Stack.Navigator>
  );
};

let styles = StyleSheet.create({
  container: {},
});

export default DriverProfileNavigator;
