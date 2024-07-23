import { FC } from "react";
import { View, StyleSheet, Text } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import colors from "@utils/colors";
import CustomText from "./CustomText";

interface Props {}

let BackButton: FC<Props> = (props) => {
  return (
    <View style={styles.container}>
      <Ionicons name="chevron-back" size={18} color={colors.active} />
      <CustomText style={styles.title}>Go Back</CustomText>
    </View>
  );
};

let styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    color: colors.active,
  },
});

export default BackButton;
