import { FC } from "react";
import { View, StyleSheet, Text, Pressable, Image } from "react-native";
import { formatPrice } from "@utils/helper";
import colors from "@utils/colors";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { LatestProduct } from "@components/LatestProductList";
import CustomText from "./CustomText";

interface Props {
  product: LatestProduct;
  onPress(item: LatestProduct): void;
}

let ProductCard: FC<Props> = ({ product, onPress }) => {
  return (
    <Pressable onPress={() => onPress(product)} style={styles.productContainer}>
      {product.thumbnail ? (
        <Image source={{ uri: product.thumbnail }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, styles.noImageView]}>
          <MaterialCommunityIcons
            name="image-off"
            size={35}
            color={colors.primary}
          />
        </View>
      )}
      <CustomText style={styles.price}>{formatPrice(product.price)}</CustomText>
      <CustomText style={styles.name}>{product.name}</CustomText>
    </Pressable>
  );
};

let styles = StyleSheet.create({
  productContainer: {
    padding: 7,
  },
  thumbnail: {
    width: "100%",
    height: 100,
    borderRadius: 5,
  },
  noImageView: {
    backgroundColor: colors.deActive,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.active,
    paddingTop: 5,
  },
});

export default ProductCard;
