import colors from "@utils/colors";
import { FC } from "react";
import { View, StyleSheet, Modal } from "react-native";
import LottieView from "lottie-react-native";

interface Props {
  visible: boolean;
}

let LoadingSpinner: FC<Props> = ({ visible }) => {
  if (!visible) return null;

  return (
    <Modal animationType="fade">
      <View style={styles.container}>
        <LottieView
          source={require("../../assets/Loading.json")}
          autoPlay
          loop
          style={{ flex: 1, transform: [{ scale: 0.5 }] }}
        />
      </View>
    </Modal>
  );
};

let styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backDrop,
  },
});

export default LoadingSpinner;
