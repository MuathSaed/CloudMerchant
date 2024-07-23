import AvatarView from "@ui/AvatarView";
import CustomText from "@ui/CustomText";
import colors from "@utils/colors";
import { formatDate } from "@utils/date";
import { FC } from "react";
import { View, StyleSheet, Dimensions } from "react-native";

interface Props {
  avatar?: string;
  name: string;
  timestamp: string;
  lastMessage: string;
  unreadMessageCount: number;
}

let { width } = Dimensions.get("window");

let profileImageSize = 50;
let itemWidth = width - 15 * 2;
let separatorWidth = width - profileImageSize - 15 * 3;

let RecentChat: FC<Props> = ({
  avatar,
  unreadMessageCount,
  timestamp,
  name,
  lastMessage,
}) => {
  let showNotification = unreadMessageCount > 0;

  return (
    <View style={styles.container}>
      <AvatarView uri={avatar} size={profileImageSize} />
      <View style={styles.chatInfo}>
        <View style={styles.flexJustifyBetween}>
          <View style={styles.flex1}>
            <CustomText style={styles.name} numberOfLines={1} ellipsizeMode="tail">
              {name}
            </CustomText>
          </View>
          <CustomText
            style={showNotification ? styles.activeText : styles.inActiveText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {formatDate(timestamp)}
          </CustomText>
        </View>

        <View style={styles.flexJustifyBetween}>
          <View style={styles.flex1}>
            <CustomText
              style={styles.commonText}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {lastMessage}
            </CustomText>
          </View>

          {showNotification ? (
            <View style={styles.msgIndicator}>
              <CustomText style={styles.msgIndicatorCount}>{unreadMessageCount}</CustomText>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

export let Separator = () => <View style={styles.separator} />;

let styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: itemWidth,
  },
  chatInfo: {
    width: itemWidth - profileImageSize,
    paddingLeft: 15,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
    color: colors.primary,
    marginRight: 15,
  },
  commonText: {
    fontSize: 12,
    color: colors.primary,
  },
  inActiveText: {
    fontSize: 12,
    color: colors.primary,
  },
  activeText: {
    fontSize: 12,
    color: colors.active,
  },
  flexJustifyBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  flex1: {
    flex: 1,
  },
  msgIndicatorCount: {
    fontSize: 12,
    color: colors.white,
  },
  msgIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.active,
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    width: separatorWidth,
    height: 1,
    backgroundColor: colors.deActive,
    alignSelf: "flex-end",
    marginVertical: 15,
  },
});

export default RecentChat;
