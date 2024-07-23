import { FC } from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";

interface Props {
  uri?: string;
}

let { width } = Dimensions.get("screen");
let imageWidth = width - 15 * 2;
let aspect = 16 / 9;

let ProductImage: FC<Props> = ({ uri }) => {
  return (
    <Image
      source={{ uri }}
      style={styles.image}
      resizeMethod="resize"
      resizeMode="cover"
    />
  );
};

let styles = StyleSheet.create({
  image: {
    width: imageWidth,
    height: imageWidth / aspect,
    borderRadius: 7,
  },
});

export default ProductImage;
