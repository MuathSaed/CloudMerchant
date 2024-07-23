import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { NavigationProp, useFocusEffect, useNavigation } from "@react-navigation/native";
import useAuth from "app/hooks/useAuth";
import axios from "axios";
import { fetchDataAsync } from "app/api/fetchDataAsync";
import { formatPrice } from "app/utils/helper";
import colors from "app/utils/colors";
import { CartItem } from "app/store/cart";
import AppButton from "@ui/AppButton";
import { AppStackParamList } from "app/navigator/AppNavigator";
import socket, { handleSocketConnection } from "app/socket";
import { useDispatch } from "react-redux";
import CustomText from "@ui/CustomText";
import EmptyView from "@ui/EmptyView";


let client = axios.create({ baseURL: "https://cloud-merchant-gp1.ew.r.appspot.com" });

interface Props {}

let CartScreen: React.FC<Props> = () => {
  let [cartItems, setCartItems] = useState<CartItem[]>([]);
  let { authState } = useAuth();
  let navigation = useNavigation<NavigationProp<AppStackParamList>>();
  let [refreshing, setRefreshing] = useState(false);
  let dispatch = useDispatch();

  useFocusEffect(() => {
    fetchCartItems();
  });

  let fetchCartItems = async () => {
    interface CartResponse {
      cartItems: CartItem[];
    }
    
    let res = await fetchDataAsync<CartResponse>(
      client.get("/cart", {
        headers: {
          Authorization: `Bearer ${authState.profile?.accessToken}`,
        },
      })
    );
    if (res) setCartItems(res.cartItems);
  };

  let handleRemoveFromCart = async (itemId: string) => {
    await fetchDataAsync(
      client.delete(`/cart/remove/${itemId}`, {
        headers: {
          Authorization: `Bearer ${authState.profile?.accessToken}`,
        },
      })
    );
    fetchCartItems();
  };

  let handleUpdateCartItem = async (itemId: string, newQuantity: number) => {
    await fetchDataAsync(
      client.patch(
        `/cart/update/${itemId}`,
        { quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${authState.profile?.accessToken}`,
          },
        }
      )
    );
    fetchCartItems();
  };

  let calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.quantity * (item.product as any).price,
      0
    );
  };

  let handleCheckout = () => {
    navigation.navigate("Checkout", { cartItems });
  };

  let renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <CustomText style={styles.itemName}>{item.product.name}</CustomText>
      <CustomText style={styles.itemPrice}>
        {formatPrice((item.product as any).price)}
      </CustomText>
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          onPress={() =>
            handleUpdateCartItem(
              item._id.toString(),
              Math.max(1, item.quantity - 1)
            )
          }
        >
          <CustomText style={styles.quantityButton}>-</CustomText>
        </TouchableOpacity>
        <CustomText style={styles.quantityValue}>{item.quantity}</CustomText>
        <TouchableOpacity
          onPress={() => handleUpdateCartItem(item._id.toString(), item.quantity + 1)}
        >
          <CustomText style={styles.quantityButton}>+</CustomText>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFromCart(item._id.toString())}
      >
        <CustomText style={styles.removeButtonText}>Remove</CustomText>
      </TouchableOpacity>
    </View>
  );

  useEffect(() => {
    if (authState.profile) handleSocketConnection(authState.profile, dispatch);
    return () => {
      socket.disconnect();
    };
  }, []);

  let fetchAll = async () => {
      setRefreshing(true);
      await fetchCartItems();
      setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <CustomText style={styles.title}>Shopping Cart</CustomText>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderCartItem}
        ListEmptyComponent={<EmptyView title="Your cart is empty" />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchAll} />
        }
        contentContainerStyle={styles.container}
      />
      {cartItems.length > 0 && (
        <View style={styles.totalContainer}>
          <CustomText style={styles.totalText}>Total:</CustomText>
          <CustomText style={styles.totalPrice}>
            {formatPrice(calculateTotal())}
          </CustomText>
        </View>
      )}
      {cartItems.length > 0 && (
        <AppButton title="Checkout" onPress={handleCheckout} />
      )}
    </View>
  );
};

let styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontFamily: "Product Sans Bold",
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  itemName: {
    flex: 1,
  },
  itemPrice: {
    marginRight: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    padding: 5,
    backgroundColor: colors.primary,
    color: colors.white,
    marginHorizontal: 5,
  },
  quantityValue: {
    marginHorizontal: 5,
  },
  removeButton: {
    backgroundColor: "red",
    padding: 5,
    borderRadius: 5,
  },
  removeButtonText: {
    color: "white",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  totalText: {
    fontWeight: "bold",
  },
  totalPrice: {
    fontWeight: "bold",
  },
});

export default CartScreen;