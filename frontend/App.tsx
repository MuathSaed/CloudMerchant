import Navigator from "app/navigator";
import FlashMessage from "react-native-flash-message";
import * as Font from 'expo-font';
import { Provider } from "react-redux";
import store from "app/store";
import { StripeProvider } from '@stripe/stripe-react-native';
import React, { useState, useEffect } from 'react';
import { Platform, SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';

let STRIPE_PUBLISHABLE_KEY = 'pk_test_51PV1LvEmv8mD5HlQMZqXKOY9gnMhZRIK4bDZQBjYUtjICFYC4kpitwHmS62nCouiUftwGdsW93VO4Thgmdpo0jdy00812RIxdL';

export default function App() {
  let [fontsLoaded, setFontsLoaded] = useState(false);

  let [fcmToken, setFcmToken] = useState('');

  useEffect(() => {
    try {
    PushNotification.createChannel(
      {
        channelId: "Channel ID",
        channelName: "fcm",
        channelDescription: "A channel to categorise your notifications",
        playSound: true,
        soundName: "default",
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`createChannel returned '${created}'`)
    );
    } catch (error) {
      console.log("Error creating channel:", error);
    }

    let getToken = async () => {
      let token = await messaging().getToken();
      setFcmToken(token);
      console.log('FCM Token:', token);
    };

    let requestUserPermission = async () => {
      let authStatus = await messaging().requestPermission();
      let enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
      }
    };

    getToken();
    requestUserPermission();

    let unsubscribe = messaging().onMessage(async remoteMessage => {
      PushNotification.localNotification({
        channelId: 'Channel ID',
        title: remoteMessage.notification?.title,
        message: remoteMessage.notification?.body || '',
      });
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background state:', remoteMessage.notification);
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage.notification);
        }
      });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let loadFontsAndSetState = async () => {
        await Font.loadAsync({
            'Product Sans Bold': require('assets/fonts/Product-Sans-Bold.ttf'),
            'Product Sans Bold Italic': require('assets/fonts/Product-Sans-Bold-Italic.ttf'),
            'Product Sans Italic': require('assets/fonts/Product-Sans-Italic.ttf'),
            'Product Sans Regular': require('assets/fonts/Product-Sans-Regular.ttf'),
        });
      setFontsLoaded(true); 
    };

    loadFontsAndSetState();
  }, []);

  return (
    <>
      {fontsLoaded && (
        <Provider store={store}>
          <StripeProvider
          publishableKey={STRIPE_PUBLISHABLE_KEY}
          merchantIdentifier="cloudmerchant.com"
          urlScheme="myapp"
          >
            <SafeAreaView style={styles.container}>
              <StatusBar
                animated={true}
                backgroundColor="transparent"
                barStyle="dark-content"
                showHideTransition="slide"
              />
              <Navigator />
              <FlashMessage position="bottom" titleStyle={styles.flashStyle} />
            </SafeAreaView>
          </StripeProvider>
        </Provider>
      )}
    </> 
  );
}

let styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  flashStyle: {
    fontFamily: 'Product Sans Regular',
    fontSize: 18
  },
});