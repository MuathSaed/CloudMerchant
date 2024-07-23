import { FC } from "react";
import { View, StyleSheet, Image } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import colors from "@utils/colors";

interface Props {
  uri?: string;
  size?: number;
}

let iconContainerFactor = 0.7;
let iconSizeFactor = 0.8;

let AvatarView: FC<Props> = ({ size = 50, uri }) => {
  let iconContainerSize = size * iconContainerFactor;
  let iconSize = size * iconSizeFactor;

  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2 },
        styles.container,
        !uri && styles.profileIcon,
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={styles.flex1} />
      ) : (
        <View
          style={[
            {
              width: iconContainerSize,
              height: iconContainerSize,
              borderRadius: iconContainerSize / 2,
            },
            styles.iconContainer,
          ]}
        >
          <FontAwesome name="user" size={iconSize} color={colors.white} />
        </View>
      )}
    </View>
  );
};

let styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  flex1: {
    flex: 1,
  },
  profileIcon: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});

export default AvatarView;
