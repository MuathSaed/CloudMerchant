import colors from "@utils/colors";
import { FC } from "react";
import { View, StyleSheet, Text } from "react-native";
import CustomText from "./CustomText";

interface Props {
  icon: JSX.Element;
  name: string;
}

let CategoryOption: FC<Props> = ({ icon, name }) => {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>{icon}</View>
      <CustomText style={styles.category}>{name}</CustomText>
    </View>
  );
};

let styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center" },
  icon: { transform: [{ scale: 0.4 }] },
  category: {
    color: colors.primary,
    paddingVertical: 10,
  },
});

export default CategoryOption;
