import AvatarView from "@ui/AvatarView";
import colors from "@utils/colors";
import { formatPrice } from "@utils/helper";
import { FC } from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import ImageSlider from "./ImageSlider";
import { Product } from "app/store/listings";
import CustomText from "@ui/CustomText";

interface Props {
  product: Product;
}

let ProductDetail: FC<Props> = ({ product }) => {
  return (
    <View style={styles.detailContainer}>
      <ScrollView>
        <ImageSlider images={product.image} />

        <CustomText style={styles.category}>{product.category}</CustomText>
        <CustomText style={styles.price}>{formatPrice(product.price)}</CustomText>
        <CustomText style={styles.date}>
          Quantity: {product.quantity}
        </CustomText>
        <CustomText style={styles.name}>{product.name}</CustomText>
        <CustomText style={styles.description}>{product.description}</CustomText>

        <View style={styles.profileContainer}>
          <AvatarView uri={product.seller.avatar} size={60} />
          <CustomText style={styles.profileName}>{product.seller.name}</CustomText>
        </View>
      </ScrollView>
    </View>
  );
};

let styles = StyleSheet.create({
  detailContainer: {
    padding: 15,
    flex: 1,
  },
  category: {
    marginTop: 15,
    color: colors.primary,
    fontWeight: "700",
  },
  price: {
    marginTop: 5,
    color: colors.active,
    fontWeight: "700",
    fontSize: 20,
  },
  date: {
    marginTop: 5,
    color: colors.active,
    fontWeight: "700",
  },
  name: {
    marginTop: 15,
    color: colors.primary,
    fontWeight: "700",
    fontSize: 20,
  },
  description: {
    marginTop: 15,
    color: colors.primary,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  profileName: {
    paddingLeft: 15,
    color: colors.primary,
    fontWeight: "600",
    fontSize: 20,
  },
});

export default ProductDetail;
