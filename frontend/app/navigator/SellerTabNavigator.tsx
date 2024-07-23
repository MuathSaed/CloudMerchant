import { createBottomTabNavigator, BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { AppNavigator } from "./AppNavigator";
import SellerProfileNavigator from "./SellerProfileNavigator";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";

let Tab = createBottomTabNavigator();

let getAddOptions = (iconName: string, title: string): BottomTabNavigationOptions => {
  return {
    tabBarIcon({ color, size }) {
      return <MaterialIcons name={iconName as any} size={size} color={color} />;
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

let SellerTabNavigator = () => {
  return (
    <Tab.Navigator initialRouteName="SellerAppNavigator" screenOptions={{ headerShown: false }}>
      <Tab.Screen
          name="SellerAppNavigator"
          options={getAddOptions("add", "Add New Product")}
        >
        {() => <AppNavigator role="Seller" />}
      </Tab.Screen> 
      <Tab.Screen
        name="SellerProfileNavigator"
        component={SellerProfileNavigator}
        options={getOptions("user", "Profile")}
      />
    </Tab.Navigator>
  );
};

export default SellerTabNavigator;
