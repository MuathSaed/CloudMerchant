import React, { FC, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { formatPrice } from "app/utils/helper";
import { formatDate } from "app/utils/date";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { ProfileNavigatorParamList } from "app/navigator/BuyerProfileNavigator";
import useAuth from "app/hooks/useAuth";
import { fetchDataAsync } from "app/api/fetchDataAsync";
import useClient from "app/hooks/useClient";
import AppHeader from "@components/AppHeader";
import BackButton from "@ui/BackButton";
import { Order, getOrders, updateOrders } from "app/store/order";
import EmptyView from "@ui/EmptyView";

interface Props {}

type HistoryResponse = {
    orders: Order[];
  };

let OrderHistory: FC<Props> = (props) => {
  let { navigate } = useNavigation<NavigationProp<ProfileNavigatorParamList>>();
  let [fetching, setFetching] = useState(false);
  let { authClient } = useClient();
  let dispatch = useDispatch();
  let orders = useSelector(getOrders);

  let fetchOrderHistory = async () => {
    setFetching(true);
    let res = await fetchDataAsync<HistoryResponse>(
        authClient.get("/order/history")
    );
    setFetching(false);
    if (res) {
        dispatch(updateOrders(res.orders));
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  return (
    <>
      <AppHeader backButton={<BackButton />} />
      <View style={styles.container}>
        <FlatList 
          refreshing={fetching}
          data={orders}
          ListEmptyComponent={<EmptyView title="No orders found." />}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.orderItem}
              onPress={() => navigate("OrderDetails", { orderId: item._id })}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderDate}>
                  {formatDate(item.createdAt)}
                </Text>
                <Text style={styles.totalAmount}>
                  {formatPrice(item.totalAmount)}
                </Text>
              </View>
              {item.items.map((orderItem) => (
                <View key={orderItem.product._id} style={styles.productItem}>
                  <Text style={styles.productName}>{orderItem.product.name}</Text>
                  <Text style={styles.productQuantity}>
                    Quantity: {orderItem.quantity}
                  </Text>
                </View>
              ))}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </>
  );
};

let styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    flexGrow: 1,
  },
  orderItem: {
    margin: 5,
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderDate: {
    fontSize: 14,
    color: '#888',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
  },
  productQuantity: {
    fontSize: 14,
    color: '#888',
  },
});

export default OrderHistory;