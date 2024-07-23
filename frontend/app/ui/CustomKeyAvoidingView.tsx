import { FC, ReactNode } from "react";
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

interface Props {
  children: ReactNode;
}

let CustomKeyAvoidingView: FC<Props> = ({ children }) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={50}
    >
      <ScrollView>{children}</ScrollView>
    </KeyboardAvoidingView>
  );
};

let styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CustomKeyAvoidingView;
