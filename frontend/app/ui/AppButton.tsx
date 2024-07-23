import colors from "@utils/colors";
import { FC } from "react";
import { StyleSheet, Pressable, Text } from "react-native";
import CustomText from "@ui/CustomText";

interface Props {
  title: string;
  active?: boolean;
  onPress?(): void;
  status?: boolean;
  style?: any;
}

let AppButton: FC<Props> = ({ title, active = true, onPress, status, style }) => {
  return (
    <Pressable
      onPress={active ? onPress : null}
      style={[style, styles.button, active ? styles.btnActive : styles.btnDeActive]}
      disabled={status}
    >
      <CustomText style={[styles.title]}>{title}</CustomText>
    </Pressable>
  );
};

let styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  btnActive: {
    backgroundColor: colors.primary,
  },
  btnDeActive: {
    backgroundColor: colors.deActive,
  },
  title: {
    fontFamily: 'Product Sans Bold',
    color: colors.white,

  },
});

export default AppButton;
