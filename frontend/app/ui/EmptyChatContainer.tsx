import colors from "@utils/colors";
import { FC } from "react";
import { View, StyleSheet, Text } from "react-native";
import CustomText from "./CustomText";

interface Props {}

let EmptyChatContainer: FC<Props> = (props) => {
  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <CustomText style={styles.message}>
          Start a conversation...
        </CustomText>
      </View>
    </View>
  );
};

let styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    transform: [{ rotate: "180deg" }]
  },
  messageContainer: {
    backgroundColor: colors.deActive,
    padding: 15,
    borderRadius: 5,
  },
  message: {
    color: colors.active,
    fontSize: 12,
    textAlign: "center",
  },
});

export default EmptyChatContainer;
