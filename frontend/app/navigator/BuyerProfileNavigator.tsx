import { FC } from "react";
import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BuyerProfile from "app/screens/BuyerProfile";
import Chats from "app/screens/Chats";
import SingleProduct from "app/screens/SingleProduct";
import { Product } from "app/store/listings";
import ChatWindow from "app/screens/ChatWindow";
import OrderDetails from "app/screens/OrderDetails";
import OrderHistory from "app/screens/OrderHistory";
import EditProfile from "app/screens/EditProfile";
import { Profile } from "app/store/auth";

export type ProfileNavigatorParamList = {
  BuyerProfile: undefined;
  Chats: undefined;
  SingleProduct: { product?: Product; id?: string };
  OrderDetails: { orderId: string };
  OrderHistory: undefined;
  ChatWindow: {
    conversationId: string;
    peerProfile: { id: string; name: string; avatar?: string };
  };
  EditProfile: { profile: Profile };
};

let Stack = createNativeStackNavigator<ProfileNavigatorParamList>();

interface Props {}

let BuyerProfileNavigator: FC<Props> = (props) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BuyerProfile" component={BuyerProfile} />
      <Stack.Screen name="Chats" component={Chats} />
      <Stack.Screen name="SingleProduct" component={SingleProduct} />
      <Stack.Screen name="OrderHistory" component={OrderHistory} />
      <Stack.Screen name="OrderDetails" component={OrderDetails} />
      <Stack.Screen name="ChatWindow" component={ChatWindow} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
    </Stack.Navigator>
  );
};

let styles = StyleSheet.create({
  container: {},
});

export default BuyerProfileNavigator;
