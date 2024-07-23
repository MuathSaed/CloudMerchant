import { FC } from "react";
import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "app/screens/Home";
import Chats from "app/screens/Chats";
import ProductList from "app/screens/ProductList";
import { Product } from "app/store/listings";
import SingleProduct from "app/screens/SingleProduct";
import ChatWindow from "app/screens/ChatWindow";
import ProductDetailScreen from "app/screens/ProductDetailScreen";
import CartScreen from "app/screens/CartScreen";
import CheckoutScreen from "app/screens/CheckoutScreen";
import { CartItem } from "app/store/cart";
import NewProduct from "app/screens/NewProduct";
import AllOrders from "app/screens/AllOrders";
import OrderDetails from "app/screens/OrderDetails";

export type AppStackParamList = {
  Home: undefined;
  Chats: undefined;
  ProductList: { category: string };
  SingleProduct: { product?: Product; id?: string };
  ChatWindow: {
    conversationId: string;
    peerProfile: { id: string; name: string; avatar?: string };
  };
  ProductDetail: { product: Product };
  Cart: undefined;
  Checkout: { cartItems: CartItem[] };
  NewListing: undefined;
  AllOrders: undefined;
  OrderDetails: { orderId: string };
};

let Stack = createNativeStackNavigator<AppStackParamList>();

interface Props {
  role: string;
}

export let AppNavigator: FC<Props> = ({role}) => {

  let routeName;

  let setRole = () => {
    if (role === 'Buyer') {
      routeName = "Home";
    } else if (role === 'Seller') {
      routeName = "NewListing";
    } else {
      routeName = "AllOrders";
    }
  }

  setRole();

  return (
    <Stack.Navigator initialRouteName={routeName} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Chats" component={Chats} />
      <Stack.Screen name="ProductList" component={ProductList} />
      <Stack.Screen name="SingleProduct" component={SingleProduct} />
      <Stack.Screen name="ChatWindow" component={ChatWindow} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} /> 
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="NewListing" component={NewProduct} />
      <Stack.Screen name="AllOrders" component={AllOrders} />
      <Stack.Screen name="OrderDetails" component={OrderDetails} />
    </Stack.Navigator>
  );
};

let styles = StyleSheet.create({
  container: {},
});

