import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import useAuth from "app/hooks/useAuth";
import { formatPrice } from "app/utils/helper";
import AppButton from "@ui/AppButton";
import { StackScreenProps } from "@react-navigation/stack";
import { AppStackParamList } from "app/navigator/AppNavigator";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import axios, { AxiosError, AxiosResponse } from "axios";
import { showMessage } from "react-native-flash-message";
import CustomText from "@ui/CustomText";
import messaging from '@react-native-firebase/messaging';

let client = axios.create({ baseURL: "https://cloud-merchant-gp1.ew.r.appspot.com" });

type Props = StackScreenProps<AppStackParamList, 'Checkout'>;

let CheckoutScreen: React.FC<Props> = ({ route }) => {
  let { navigate } = useNavigation<NavigationProp<AppStackParamList>>();
  let { cartItems } = route.params;
  let { initPaymentSheet, presentPaymentSheet } = useStripe();
  let { authState } = useAuth();
  let [loading, setLoading] = useState(false);
  let [fcmToken, setFcmToken] = useState<string | null>(null);

  let getToken = async () => {
    try {
      let token = await messaging().getToken();
      setFcmToken(token);
      console.log("FCM token:", token);
    } catch (error) {
      console.log("Error getting FCM token:", error);
    }
  };

  let onTokenRefresh = messaging().onTokenRefresh(async (token) => {
    console.log('Refreshed FCM Token:', token);
  });

  useEffect(() => {
    getToken();
    return () => {
      onTokenRefresh();
    };
  }, []);

  let calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.quantity * (item.product as any).price,
      0
    );
  };

  let response: AxiosResponse;

  let handlePay = async (method: string) => {
    try {
      console.log(authState.profile?.location?.latitude);
      console.log(authState.profile?.location?.longitude);
      console.log(authState.profile?.name);
      setLoading(true);
      response = await client.post(
        "/order/create",
        {
          cartItems,
          totalAmount: calculateTotal(),
          name: authState.profile?.name,
          shippingAddress: {
            address: authState.profile?.address,
            city: authState.profile?.city,
          },
          location: {
            latitude: authState.profile?.location?.latitude,
            longitude: authState.profile?.location?.longitude,
          },
          notificationToken: fcmToken,
          paymentMethod: method,
          paymentMethodId: "pm_card_visa",
        },
        {
          headers: {
            Authorization: `Bearer ${authState.profile?.accessToken}`,
          },
        }
      );

      if (method === "Cash on Delivery") {
        if (response.status === 201) {
          Alert.alert("Success", "Your order has been placed!");
          navigate("Home");
        } else {
          Alert.alert("Error", "Order creation failed. Please try again later.");
        }
        return;
      }

      let { paymentIntent } = response.data;

      let paymentIntentId = paymentIntent.split("_secret")[0];

      console.log("PaymentIntent:", paymentIntent);

      let { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: paymentIntent,
          merchantDisplayName: "CloudMerchant",
      });

      if (initError) {
        console.log("PaymentSheet init error:", initError);
        Alert.alert("Error", "Something went wrong. Please try again.");
        return;
      }

      let { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        console.log("PaymentSheet error:", paymentError);
        Alert.alert("Error", "Payment failed. Please try again.");
      } else {
        try {
            let res = await client.post(
                '/order/confirm',
                { 
                  cartItems,
                  name: authState.profile?.name,
                  totalAmount: calculateTotal(),
                  shippingAddress: {
                    address: authState.profile?.address,
                    city: authState.profile?.city,
                  },
                  location: {
                    latitude: authState.profile?.location?.latitude,
                    longitude: authState.profile?.location?.longitude,
                  },
                  notificationToken: fcmToken,
                  paymentMethod: method,
                  paymentIntentId: paymentIntentId }, 
                {
                    headers: {
                        Authorization: `Bearer ${authState.profile?.accessToken}`,
                    },
                }
            );
    
            if (res.status === 201) {
                Alert.alert("Success", "Your order has been placed!");
                navigate("Home"); 
            } else {
                Alert.alert("Error", "Order creation failed. Please try again later."); 
            }
        } catch (error) {
            console.error("Error confirming order:", error);
            Alert.alert("Error", "Something went wrong. Please try again.");
        }
      }
    } catch (error) {
      let msg = error as AxiosError;
      if (msg.message === "Request failed with status code 403") {
        showMessage({ message: "User is not verified. Please verify your account.", type: "danger" });
        return;
      }
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomText style={styles.title}>Checkout</CustomText>
      <View style={styles.summary}>
        <CustomText style={styles.summaryLabel}>Order Summary</CustomText>
        {cartItems.map((item) => (
          <View key={item._id.toString()} style={styles.item}>
            <CustomText>{item.product.name}</CustomText>
            <CustomText>
              {item.quantity} x {formatPrice((item.product as any).price)}
            </CustomText>
          </View>
        ))}
        <View style={styles.total}>
          <CustomText style={styles.totalLabel}>Total:</CustomText>
          <CustomText style={styles.totalAmount}>
            {formatPrice(calculateTotal())}
          </CustomText>
        </View>
      </View>
      <AppButton
        title={loading ? "Processing..." : "Pay Now"}
        onPress={() => handlePay("Online Payment")}
        status={loading}
      />
      <AppButton
        title={"Cash on Delivery"}
        onPress={() => handlePay("Cash on Delivery")}
        status={loading}
        style={{ marginTop: 10 }}
      />
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
    marginBottom: 20,
    fontFamily: "Product Sans Bold",
  },
  summary: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 18,
    marginBottom: 10,
    fontFamily: "Product Sans Bold",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  total: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 5,
  },
  totalLabel: {
    fontFamily: "Product Sans Bold",
  },
  totalAmount: {
    fontFamily: "Product Sans Bold",
  },
});

export default CheckoutScreen;
