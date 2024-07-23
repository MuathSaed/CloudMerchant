import colors from "@utils/colors";
import { FC } from "react";
import { View, StyleSheet, Text } from "react-native";
import CustomText from "./CustomText";

interface Props {
  title: string;
}

let EmptyView: FC<Props> = ({ title }) => {
  return (
    <View style={styles.container}>
      <CustomText style={styles.title}>{title}</CustomText>
    </View>
  );
};

let styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: colors.primary,
    opacity: 0.6,
    fontSize: 20,
    fontWeight: "600",
  },
});

export default EmptyView;
