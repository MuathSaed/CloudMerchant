import CategoryList from "@components/CategoryList";
import LatestProductList, { LatestProduct } from "@components/LatestProductList";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import ChatNotification from "@ui/ChatNotification";
import { fetchDataAsync } from "app/api/fetchDataAsync";
import useAuth from "app/hooks/useAuth";
import useClient from "app/hooks/useClient";
import { AppStackParamList } from "app/navigator/AppNavigator";
import socket, { handleSocketConnection } from "app/socket";
import { ActiveChat, addNewActiveChats, getUnreadChatsCount } from "app/store/chats";
import TopLogo from "app/svg/TopLogo";
import { FC, useEffect, useState } from "react";
import { StyleSheet, ScrollView, RefreshControl, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

interface Props {}

let Home: FC<Props> = (props) => {
  let [products, setProducts] = useState<LatestProduct[]>([]);
  let { navigate } = useNavigation<NavigationProp<AppStackParamList>>();
  let [refreshing, setRefreshing] = useState(false);
  let { authClient } = useClient();
  let { authState } = useAuth();
  let dispatch = useDispatch();
  let totalUnreadMessages = useSelector(getUnreadChatsCount);

  let fetchLatestProduct = async () => {
    let res = await fetchDataAsync<{ products: LatestProduct[] }>(
      authClient.get("/product/latest")
    );
    if (res?.products) {
      setProducts(res.products);
    }
  };

  let fetchLastChats = async () => {
    let res = await fetchDataAsync<{
      chats: ActiveChat[];
    }>(authClient("/conversation/last-chats"));

    if (res) {
      dispatch(addNewActiveChats(res.chats));
    }
  };

  useEffect(() => {
    let handleApiRequest = async () => {
      await fetchLatestProduct();
      await fetchLastChats();
    };
    handleApiRequest();
  }, []);

  useEffect(() => {
    if (authState.profile) handleSocketConnection(authState.profile, dispatch);
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
    <View style={styles.header}> 
          <TopLogo />
          <ChatNotification
            onPress={() => navigate('Chats')}
            indicate={totalUnreadMessages > 0}
          />
    </View>
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => navigate("Home")} />
      }
    >
        
      <ScrollView style={styles.container}>
        <CategoryList
          onPress={(category) => navigate("ProductList", { category })}
        />
        <LatestProductList
          data={products}
          onPress={({ id }) => navigate("SingleProduct", { id })}
        />
      </ScrollView>
    </ScrollView>
    </>
  );
};

let styles = StyleSheet.create({
  container: {
    padding: 15,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    paddingLeft: 15,
    paddingRight: 15,
  },
});

export default Home;
