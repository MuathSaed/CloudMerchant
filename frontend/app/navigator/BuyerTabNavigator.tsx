import { createBottomTabNavigator, BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { AppNavigator } from "./AppNavigator";
import AntDesign from "react-native-vector-icons/AntDesign";
import Feather from "react-native-vector-icons/Feather";
import CartScreen from "app/screens/CartScreen";
import BuyerProfileNavigator from "./BuyerProfileNavigator";

  let Tab = createBottomTabNavigator();

  let getOptionsHome = (iconName: string, title: string): BottomTabNavigationOptions => {
    return {
      tabBarIcon({ color, size }) {
        return <Feather name={iconName as any} size={size} color={color} />;
      },
      title: title
    };
  };
  
  let getOptions = (iconName: string, title: string): BottomTabNavigationOptions => {
    return {
      tabBarIcon({ color, size }) {
        return <AntDesign name={iconName as any} size={size} color={color} />;
      },
      title: title
    };
  };
  
  let BuyerTabNavigator = () => {
    return (
      <Tab.Navigator initialRouteName="BuyerAppNavigator" screenOptions={{ headerShown: false }}>
        <Tab.Screen
          name="BuyerAppNavigator"
          options={getOptionsHome("home", "Home")}
        >
          {() => <AppNavigator role="Buyer" />}
        </Tab.Screen>

        <Tab.Screen
          name="BuyerProfileNavigator"
          component={BuyerProfileNavigator}
          options={getOptionsHome("user", "Profile")}
        />
        <Tab.Screen
          name="CartNavigator"
          component={CartScreen}
          options={getOptions("shoppingcart", "Cart")}
        />
      </Tab.Navigator>
    );
  };
  
  export default BuyerTabNavigator;
  