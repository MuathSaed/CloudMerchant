import { useNavigation } from "@react-navigation/native";
import { FC } from "react";
import { View, StyleSheet, Pressable } from "react-native";

interface Props {
  backButton?: JSX.Element | null;
  center?: JSX.Element | null;
  right?: JSX.Element | null;
}

let AppHeader: FC<Props> = ({ backButton, center, right }) => {
  let { goBack, canGoBack } = useNavigation();
  return (
    <View style={styles.container}>
      {canGoBack() && <Pressable onPress={goBack}>{backButton}</Pressable>}
      {center}
      {right}
    </View>
  );
};

let styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
  },
});

export default AppHeader;
