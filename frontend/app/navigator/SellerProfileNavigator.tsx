import { FC } from "react";
import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SellerProfile from "app/screens/SellerProfile";
import Chats from "app/screens/Chats";
import Products from "app/screens/Products";
import SingleProduct from "app/screens/SingleProduct";
import { Product } from "app/store/listings";
import ChatWindow from "app/screens/ChatWindow";
import EditProduct from "app/screens/EditProduct";
import { Profile } from "app/store/auth";
import EditProfile from "app/screens/EditProfile";

export type ProfileNavigatorParamList = {
  SellerProfile: undefined;
  Chats: undefined;
  Products: undefined;
  SingleProduct: { product?: Product; id?: string };
  EditProduct: { product: Product };
  ChatWindow: {
    conversationId: string;
    peerProfile: { id: string; name: string; avatar?: string };
  };
  EditProfile: { profile: Profile };
};

let Stack = createNativeStackNavigator<ProfileNavigatorParamList>();

interface Props {}

let SellerProfileNavigator: FC<Props> = (props) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SellerProfile" component={SellerProfile} />
      <Stack.Screen name="Chats" component={Chats} />
      <Stack.Screen name="Products" component={Products} />
      <Stack.Screen name="SingleProduct" component={SingleProduct} />
      <Stack.Screen name="ChatWindow" component={ChatWindow} />
      <Stack.Screen name="EditProduct" component={EditProduct} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
    </Stack.Navigator>
  );
};

let styles = StyleSheet.create({
  container: {},
});

export default SellerProfileNavigator;
