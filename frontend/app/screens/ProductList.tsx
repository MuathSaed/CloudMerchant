import AppHeader from "@components/AppHeader";
import { LatestProduct } from "@components/LatestProductList";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import BackButton from "@ui/BackButton";
import CustomText from "@ui/CustomText";
import EmptyView from "@ui/EmptyView";
import ProductCard from "@ui/ProductCard";
import colors from "@utils/colors";
import { fetchDataAsync } from "app/api/fetchDataAsync";
import useClient from "app/hooks/useClient";
import { AppStackParamList } from "app/navigator/AppNavigator";
import { FC, useEffect, useState } from "react";
import { View, StyleSheet, Text, FlatList } from "react-native";

type Props = NativeStackScreenProps<AppStackParamList, "ProductList">;

let col = 2;

let ProductList: FC<Props> = ({ route, navigation }) => {
  let [products, setProducts] = useState<LatestProduct[]>([]);
  let { authClient } = useClient();
  let { category } = route.params;

  let isOdd = products.length % col !== 0;

  let fetchProducts = async (category: string) => {
    let res = await fetchDataAsync<{ products: LatestProduct[] }>(
      authClient.get("/product/by-category/" + category)
    );
    if (res) {
      setProducts(res.products);
    }
  };

  useEffect(() => {
    fetchProducts(category);
  }, [category]);

  if (!products.length)
    return (
      <View style={styles.container}>
        <AppHeader
          backButton={<BackButton />}
          center={<CustomText style={styles.title}>{category}</CustomText>}
        />

        <EmptyView title="There is no product in this category!" />
      </View>
    );

  return (
    <View style={styles.container}>
      <AppHeader
        backButton={<BackButton />}
        center={<CustomText style={styles.title}>{category}</CustomText>}
      />
      <FlatList
        numColumns={col}
        data={products}
        renderItem={({ item, index }) => (
          <View
            style={{
              flex: isOdd && index === products.length - 1 ? 1 / col : 1,
            }}
          >
            <ProductCard
              product={item}
              onPress={({ id }) => navigation.navigate("SingleProduct", { id })}
            />
          </View>
        )}
      />
    </View>
  );
};

let styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  title: {
    fontWeight: "600",
    color: colors.primary,
    paddingBottom: 5,
    fontSize: 18,
  },
});

export default ProductList;
