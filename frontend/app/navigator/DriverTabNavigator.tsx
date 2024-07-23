import { createBottomTabNavigator, BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { AppNavigator } from "./AppNavigator";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import DriverProfileNavigator from "./DriverProfileNavigator";

let Tab = createBottomTabNavigator();

let getAddOptions = (iconName: string, title: string): BottomTabNavigationOptions => {
  return {
    tabBarIcon({ color, size }) {
      return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
    },
    title: title,
  };
};

let getOptions = (iconName: string, title: string): BottomTabNavigationOptions => {
  return {
    tabBarIcon({ color, size }) {
      return <Feather name={iconName as any} size={size} color={color} />;
    },
    title: title,
  };
};

let DriverTabNavigator = () => {
  return (
    <Tab.Navigator initialRouteName="DriverAppNavigator" screenOptions={{ headerShown: false }}>
      <Tab.Screen
          name="DriverAppNavigator"
          options={getAddOptions("truck-delivery-outline", "Orders")}
      >
        {() => <AppNavigator role="Driver" />}
      </Tab.Screen>
      <Tab.Screen
        name="DriverProfileNavigator"
        component={DriverProfileNavigator}
        options={getOptions("user", "Profile")}
      />
    </Tab.Navigator>
  );
};

export default DriverTabNavigator;
