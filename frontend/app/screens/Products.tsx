import AppHeader from "@components/AppHeader";
import BackButton from "@ui/BackButton";
import ProductImage from "@ui/ProductImage";
import { fetchDataAsync } from "app/api/fetchDataAsync";
import useClient from "app/hooks/useClient";
import { FC, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Text, Pressable } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { ProfileNavigatorParamList } from "app/navigator/SellerProfileNavigator";
import { Product, getListings, updateListings } from "app/store/listings";
import { useDispatch, useSelector } from "react-redux";
import CustomText from "@ui/CustomText";

interface Props {}

type ListingResponse = {
  products: Product[];
};

let Products: FC<Props> = (props) => {
  let { navigate } = useNavigation<NavigationProp<ProfileNavigatorParamList>>();
  let [fetching, setFetching] = useState(false);
  let { authClient } = useClient();
  let dispatch = useDispatch();
  let listings = useSelector(getListings);

  let fetchListings = async () => {
    setFetching(true);
    let res = await fetchDataAsync<ListingResponse>(
      authClient.get("/product/listings")
    );
    setFetching(false);
    if (res) {
      dispatch(updateListings(res.products));
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <>
      <AppHeader backButton={<BackButton />} />
      <View style={styles.container}>
        <FlatList
          refreshing={fetching}
          onRefresh={fetchListings}
          data={listings}
          contentContainerStyle={styles.flatList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            return (
              <Pressable
                onPress={() => navigate("SingleProduct", { product: item })}
                style={styles.listItem}
              >
                <ProductImage uri={item.thumbnail} />
                <CustomText style={styles.productName} numberOfLines={2}>
                  {item.name}
                </CustomText>
              </Pressable>
            );
          }}
        />
      </View>
    </>
  );
};

let styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  listItem: {
    paddingBottom: 15,
  },
  flatList: {
    paddingBottom: 20,
  },
  productName: {
    fontWeight: "700",
    fontSize: 20,
    paddingTop: 10,
  },
});

export default Products;
