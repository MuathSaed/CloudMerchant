import colors from "@utils/colors";
import { FC } from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import CustomText from "@ui/CustomText";
import Logo from "app/svg/Logo";

interface Props {
  message?: string;
}

let WelcomeHeader: FC<Props> = ({message}) => {
  return (
    <View style={styles.container}>
      <Logo/>
      <CustomText style={styles.subHeading}>{message}</CustomText>
    </View>
  );
};

let styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  image: {
    width: 350,
    height: 200,
  },
  subHeading: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 14,
    color: colors.primary,
  },
});

export default WelcomeHeader;
