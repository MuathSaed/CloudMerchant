import { FC } from "react";
import { StyleSheet, Pressable } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import colors from "@utils/colors";

interface Props {
  visible?: boolean;
  onPress?(): void;
}

let OptionButton: FC<Props> = ({ visible, onPress }) => {
  if (!visible) return null;

  return (
    <Pressable onPress={onPress}>
      <Ionicons
        name="ellipsis-vertical-sharp"
        color={colors.primary}
        size={20}
      />
    </Pressable>
  );
};

let styles = StyleSheet.create({
  container: {},
});

export default OptionButton;
