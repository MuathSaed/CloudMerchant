import { FC } from "react";
import { View, StyleSheet, Text } from "react-native";
import AvatarView from "./AvatarView";
import colors from "@utils/colors";
import CustomText from "./CustomText";

interface Props {
  name: string;
  avatar?: string;
}

let PeerProfile: FC<Props> = ({ name, avatar }) => {
  return (
    <View style={styles.container}>
      <AvatarView size={35} uri={avatar} />
      <CustomText style={styles.name}>{name}</CustomText>
    </View>
  );
};

let styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    color: colors.primary,
    paddingLeft: 5,
    fontWeight: "600",
  },
});

export default PeerProfile;
