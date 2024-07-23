import colors from "@utils/colors";
import { FC } from "react";
import { View, StyleSheet } from "react-native";
import ProductGridView from "./ProductGridView";
import CustomText from "@ui/CustomText";

export type LatestProduct = {
  id: string;
  name: string;
  thumbnail?: string;
  category: string;
  price: number;
};

interface Props {
  data: LatestProduct[];
  onPress(product: LatestProduct): void;
}

let LatestProductList: FC<Props> = ({ data, onPress }) => {
  return (
    <View style={styles.container}>
      <CustomText style={styles.title}>Recent Products</CustomText>
      <ProductGridView data={data} onPress={onPress} />
    </View>
  );
};

let styles = StyleSheet.create({
  container: {},
  title: {
    fontWeight: "600",
    color: colors.primary,
    fontSize: 20,
    marginBottom: 15,
  },
});

export default LatestProductList;
