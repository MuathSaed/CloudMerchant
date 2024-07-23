import colors from "@utils/colors";
import { FC } from "react";
import { StyleSheet, Pressable } from "react-native";
import AntDesign from 'react-native-vector-icons/AntDesign';
import CustomText from "@ui/CustomText";

interface Props {
  onPress?(): void;
  title: string;
}

let OptionSelector: FC<Props> = ({ title, onPress }) => {
  return (
    <Pressable style={styles.categorySelector} onPress={onPress}>
      <CustomText style={styles.categoryTitle}>{title}</CustomText>
      <AntDesign name="caretdown" color={colors.primary} />
    </Pressable>
  );
};

let styles = StyleSheet.create({
  categorySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.deActive,
    borderRadius: 5,
  },
  categoryTitle: {
    color: colors.primary,
  },
});

export default OptionSelector;
