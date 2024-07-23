import React, { FC, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Modal, Dimensions, Platform, PermissionsAndroid, RefreshControl } from 'react-native';
import { formatPrice } from 'app/utils/helper';
import { Order } from 'app/store/order';
import useAuth from 'app/hooks/useAuth';
import { fetchDataAsync } from 'app/api/fetchDataAsync';
import { ProfileNavigatorParamList } from 'app/navigator/BuyerProfileNavigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import useClient from 'app/hooks/useClient';
import AppHeader from '@components/AppHeader';
import BackButton from '@ui/BackButton';
import CustomText from '@ui/CustomText';
import AppButton from '@ui/AppButton';
import { showMessage } from 'react-native-flash-message';
import MapView, { Marker, Region } from 'react-native-maps';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import firestore from '@react-native-firebase/firestore';
import MapViewDirections from 'react-native-maps-directions';
import { AppStackParamList } from 'app/navigator/AppNavigator';
import axios from 'axios';

let client = axios.create({ baseURL: "https://cloud-merchant-gp1.ew.r.appspot.com" });
let GOOGLE_MAPS_APIKEY = 'AIzaSyCHIhQeuNtvS_RyXW5BiQVMsKl4MdOuqYM';

type Props = NativeStackScreenProps<ProfileNavigatorParamList, "OrderDetails">;

let OrderDetails: FC<Props> = ({ route, navigation }) => {
  let { navigate } = useNavigation<NavigationProp<AppStackParamList>>();
  let { orderId } = route.params;
  let { authState } = useAuth();
  let { authClient } = useClient();
  let [busy, setBusy] = useState(false);
  let [refreshing, setRefreshing] = useState(false);
  let [order, setOrder] = useState<Order>();
  let [mapVisible, setMapVisible] = useState(false);
  let [driverLocation, setDriverLocation] = useState<Region>();

  let fetchOrderDetails = async (status?: string) => {
    setBusy(true);
    let res = await fetchDataAsync<{ order: Order }>(
      authClient.get("/order/" + orderId)
    );
    if (res) {
      setOrder(res.order);
    }
    setBusy(false);

    if (status) {
      handleOrderStatus(status, res?.order.status || "");
    }
  };

  let handleOrderStatus = async (status: string, result: string) => {
    console.log('Order status:', result);
    if (result === "Delivered") {
      showMessage({ message: "Order already delivered.", type: "warning" });
      return;
    }

    if (result === "Cancelled") {
      showMessage({ message: "Order already cancelled.", type: "warning" });
      return;
    }

    setBusy(true);
    let res = await fetchDataAsync<{ message: string }>(
      authClient.put(`/order/${orderId}/status`, { status })
    );
    setBusy(false);

    if (res) {
      sendPushNotification(order?.user, 'Delivery Status', `Your order is now ${status}.`); 

      if (status === "Cancelled") {
        showMessage({ message: "Order cancelled successfully.", type: "success" });
        navigate("Home");
        return;
      } 

      if (status === "Out to Delivery") {
        startTrackingLocation();
      }

      showMessage({ message: "Order status updated successfully.", type: "success" });
      fetchOrderDetails();

      if (status === "Delivered") {
        navigate("AllOrders");
      }


    }
  };

  let startTrackingLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      return;
    }

    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 0 },
      (location) => {
        let { latitude, longitude } = location.coords;
        firestore()
          .collection('orders')
          .doc(orderId)
          .set({ driverLocation: { latitude, longitude } }, { merge: true });
      }
    );
  };

  let fetchDriverLocation = async () => {
    let orderDoc = await firestore().collection('orders').doc(orderId).get();
    if (orderDoc.exists) {
      let data = orderDoc.data();
      if (data?.driverLocation) {
        setDriverLocation({
          latitude: data.driverLocation.latitude,
          longitude: data.driverLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    }
  };

  let trackDriver = async () => {
    setMapVisible(true);
    await fetchDriverLocation();
  };

  let sendPushNotification = async (userId: string | undefined, title: string, body: string) => {
    if (!userId) return;
    console.log('Sending push notification to:', userId);
  
    try {
      await client.post('/send-notification', {
        userId: userId,
        title: title,
        body: body,
      });
      console.log('Push notification sent successfully');
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  };

  let fetchAll = async () => {
    setRefreshing(true);
    await fetchOrderDetails();
    setRefreshing(false);
  }
  

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  if (!order) {
    return (
      <View style={styles.container}>
        <CustomText>Loading order details...</CustomText>
      </View>
    );
  }

  return (
    <>
      <AppHeader backButton={<BackButton />} />
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchAll} />
        }
        contentContainerStyle={styles.container}>
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Order Items</CustomText>
          {order.items && order.items.map((item) => (
            <View key={item.product._id} style={styles.orderItem}>
              <CustomText style={styles.productName}>{item.product.name}</CustomText>
              <View style={styles.productDetails}>
                <CustomText>Quantity: {item.quantity}</CustomText>
                <CustomText>Price: {formatPrice(item.product.price)}</CustomText>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Shipping Address</CustomText>
          <CustomText>{order.items && order.name}</CustomText>
          <CustomText>{order.items && order.shippingAddress.address}</CustomText>
          <CustomText>{order.items && order.shippingAddress.city}</CustomText>
        </View>

        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Payment Details</CustomText>
          <CustomText>Payment Method: {order.items && order.paymentMethod}</CustomText>
        </View>

        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Order Total</CustomText>
          <CustomText style={styles.totalAmount}>{order.items && formatPrice(order.totalAmount)}</CustomText>
        </View>

        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Order Status</CustomText>
          <CustomText>{order.items && order.status}</CustomText>
        </View>

        {authState.profile?.role === "Buyer" && order.status !== "Cancelled" && order.status !== "Delivered" && (
          <>
            <AppButton
              title="Cancel Order"
              style={{ marginBottom: 16 }}
              onPress={() => fetchOrderDetails("Cancelled")}
            />
            {order.status !== "Pending" && (
              <AppButton
                title="Track Driver"
                style={{ marginBottom: 16 }}
                onPress={trackDriver}
              />
            )}
          </>
        )}

        {authState.profile?.role === "Driver" && order.status !== "Cancelled" && order.status !== "Delivered" && (
          <>
          
            <AppButton style={{ marginBottom: 15 }} title="Get Location from Map" onPress={trackDriver} />
            {order.status === "Pending" && (
              <AppButton
                title="Out to Delivery"
                style={{ marginBottom: 16 }}
                onPress={() => fetchOrderDetails("Out to Delivery")}
              />
            )}
            {order.status === "Out to Delivery" && (
              <AppButton
                title="Mark as Near You"
                style={{ marginBottom: 16 }}
                onPress={() => fetchOrderDetails("Near You")}
              />
            )}
          {order.status === "Near You" && (
            <AppButton
              title="Mark as Delivered"
              onPress={() => fetchOrderDetails("Delivered")}
            />
          )}
          </>
        )}

            <Modal visible={mapVisible} animationType="slide">
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: order.location.latitude,
                  longitude: order.location.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                onPress={() => setMapVisible(false)}
              >
                {driverLocation && (
                  <Marker 
                  pinColor='blue'
                  coordinate={{
                    latitude: driverLocation.latitude,
                    longitude: driverLocation.longitude
                  }} />
                )}
                  <Marker 
                  pinColor='green'
                  coordinate={{
                    latitude: order.location.latitude,
                    longitude: order.location.longitude
                  }} />
                {driverLocation && (
                  <MapViewDirections
                    origin={order.location}
                    destination={driverLocation}
                    apikey={GOOGLE_MAPS_APIKEY}
                    strokeWidth={3}
                    strokeColor="hotpink"
                  />
                )}
              </MapView>
              <AppButton title="Close Map" onPress={() => setMapVisible(false)} />
            </Modal>
      </ScrollView>
    </>
  );
};

let styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
    fontFamily: 'Product Sans Bold',
  },
  orderItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default OrderDetails;
