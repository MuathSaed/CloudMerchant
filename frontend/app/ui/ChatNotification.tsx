import { FC } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "@utils/colors";

interface Props {
  indicate?: boolean;
  onPress?(): void;
}

let ChatNotification: FC<Props> = ({ indicate, onPress }) => {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <MaterialCommunityIcons
        name="message"
        size={24}
        color={indicate ? colors.active : colors.primary}
      />
      {indicate && <View style={styles.indicator} />}
    </Pressable>
  );
};

let styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    alignSelf: "flex-end",
    position: "relative",
  },
  indicator: {
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: colors.active,
    position: "absolute",
    top: 0,
    right: 10,
    borderWidth: 2,
    borderColor: colors.white,
  },
});

export default ChatNotification;
