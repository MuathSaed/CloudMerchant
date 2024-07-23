import ProfileOptionListItem from "@components/ProfileOptionListItem";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import AvatarView from "@ui/AvatarView";
import FormDivider from "@ui/FormDivider";
import colors from "@utils/colors";
import useAuth from "app/hooks/useAuth";
import { ProfileNavigatorParamList } from "app/navigator/BuyerProfileNavigator";
import { FC, useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TextInput, Pressable, RefreshControl } from "react-native";
import { fetchDataAsync } from "app/api/fetchDataAsync";
import useClient from "app/hooks/useClient";
import { ProfileRes } from "app/navigator";
import { useDispatch, useSelector } from "react-redux";
import { updateAuthState } from "app/store/auth";
import { showMessage } from "react-native-flash-message";
import { ActiveChat, addNewActiveChats, getUnreadChatsCount } from "app/store/chats";
import CustomText from "@ui/CustomText";
import socket, { handleSocketConnection } from "app/socket";

interface Props {}

let BuyerProfile: FC<Props> = (props) => {
  let { navigate } = useNavigation<NavigationProp<ProfileNavigatorParamList>>();
  let { authState, signOut } = useAuth();
  let { profile } = authState;
  let [busy, setBusy] = useState(false);
  let [refreshing, setRefreshing] = useState(false);
  let { authClient } = useClient();
  let dispatch = useDispatch();
  let totalUnreadMessages = useSelector(getUnreadChatsCount);

  let onMessagePress = () => {
    navigate("Chats");
  };

  let onHistoryPress = () => {
    navigate("OrderHistory");
  };

  let onEditProfilePress = () => {
    if (profile) {
      navigate("EditProfile", { profile });
    }
  };

  let fetchProfile = async () => {
    setRefreshing(true);
    let res = await fetchDataAsync<{ profile: ProfileRes }>(
      authClient.get("/auth/profile")
    );
    setRefreshing(false);
    if (res) {
      dispatch(
        updateAuthState({
          profile: { ...profile!, ...res.profile },
          pending: false,
        })
      );
    }
  };

  let getVerificationLink = async () => {
    setBusy(true);
    let res = await fetchDataAsync<{ message: string }>(
      authClient.get("/auth/verify-token")
    );
    setBusy(false);
    if (res) {
      showMessage({ message: res.message, type: "success" });
    }
  };

  let fetchChats = async () => {
    let res = await fetchDataAsync<{
      chats: ActiveChat[];
    }>(authClient("/conversation/last-chats"));

    if (res) {
      dispatch(addNewActiveChats(res.chats));
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (authState.profile) handleSocketConnection(authState.profile, dispatch);
    return () => {
      socket.disconnect();
    };
  }, []);

  let fetchAll = async () => {
    setRefreshing(true);
    await fetchProfile();
    await fetchChats();
    setRefreshing(false);
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchAll} />
      }
      contentContainerStyle={styles.container}
    >
      {!profile?.verified && (
        <View style={styles.verificationLinkContainer}>
          <CustomText style={styles.verificationTitle}>
            It look like your profile is not verified.
          </CustomText>
          {busy ? (
            <CustomText style={styles.verificationLink}>Please Wait...</CustomText>
          ) : (
            <CustomText onPress={getVerificationLink} style={styles.verificationLink}>
              Tap here to get the link.
            </CustomText>
          )}
        </View>
      )}
      <View style={styles.profileContainer}>
        <AvatarView uri={profile?.avatar} size={80} />

        <View style={styles.profileInfo}>
          <View style={styles.nameContainer}>
            <TextInput
              value={profile?.name}
              style={styles.name}
            />
          </View>
          <CustomText style={styles.email}>{profile?.email}</CustomText>
        </View>
      </View>

      <FormDivider />

      <ProfileOptionListItem
        style={styles.marginBottom}
        antIconName="message1"
        title="Messages"
        onPress={onMessagePress}
        active={totalUnreadMessages > 0}
      />
      <ProfileOptionListItem
        style={styles.marginBottom}
        antIconName="dashboard"
        title="Order History"
        onPress={onHistoryPress}
      />
      <ProfileOptionListItem
        style={styles.marginBottom}
        antIconName="edit"
        title="Edit Profile"
        onPress={onEditProfilePress}
      />
      <ProfileOptionListItem
        antIconName="logout"
        title="Log out"
        onPress={signOut}
      />
    </ScrollView>
  );
};

let styles = StyleSheet.create({
  verificationLinkContainer: {
    padding: 10,
    backgroundColor: colors.deActive,
    marginVertical: 10,
    borderRadius: 5,
  },
  verificationTitle: {
    fontWeight: "600",
    color: colors.primary,
    textAlign: "center",
  },
  verificationLink: {
    fontWeight: "600",
    color: colors.active,
    textAlign: "center",
    paddingTop: 5,
  },
  container: {
    padding: 15,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
    paddingLeft: 15,
  },
  name: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "bold",
  },
  email: {
    color: colors.primary,
    paddingTop: 2,
  },
  marginBottom: {
    marginBottom: 15,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default BuyerProfile;
