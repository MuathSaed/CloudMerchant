import AppHeader from "@components/AppHeader";
import RecentChat, { Separator } from "@components/RecentChat";
import { NavigationProp, useFocusEffect, useNavigation } from "@react-navigation/native";
import BackButton from "@ui/BackButton";
import EmptyView from "@ui/EmptyView";
import { fetchDataAsync } from "app/api/fetchDataAsync";
import useClient from "app/hooks/useClient";
import { ProfileNavigatorParamList } from "app/navigator/SellerProfileNavigator";
import { ActiveChat, addNewActiveChats, getActiveChats, removeUnreadChatCount } from "app/store/chats";
import { FC, useState } from "react";
import { StyleSheet, FlatList, Pressable, RefreshControl } from "react-native";
import { useDispatch, useSelector } from "react-redux";

interface Props {}

let Chats: FC<Props> = (props) => {
  let { authClient } = useClient();
  let { navigate } = useNavigation<NavigationProp<ProfileNavigatorParamList>>();
  let [refreshing, setRefreshing] = useState(false);
  let chats = useSelector(getActiveChats);
  let dispatch = useDispatch();

  let onChatPress = (chat: ActiveChat) => {
    dispatch(removeUnreadChatCount(chat.id));
    navigate("ChatWindow", {
      conversationId: chat.id,
      peerProfile: chat.peerProfile,
    });
  };

  if (!chats.length)
    return (
      <>
        <AppHeader backButton={<BackButton />} />
        <EmptyView title="There is no chats." />
      </>
    );

  let fetchChats = async () => {
    let res = await fetchDataAsync<{
      chats: ActiveChat[];
    }>(authClient("/conversation/last-chats"));

    if (res) {
      dispatch(addNewActiveChats(res.chats));
    }
  };

  useFocusEffect(() => {
    setRefreshing(true);
    fetchChats();
    setRefreshing(false);
  });

  return (
    <>
    <AppHeader backButton={<BackButton />} />
    <FlatList
        data={chats}
        contentContainerStyle={styles.container}
        renderItem={({ item }) => ( 
            <Pressable onPress={() => onChatPress(item)}>
                <RecentChat
                    name={item.peerProfile.name}
                    avatar={item.peerProfile.avatar}
                    timestamp={item.timestamp}
                    lastMessage={item.lastMessage}
                    unreadMessageCount={item.unreadChatCounts}
                />
            </Pressable>
        )}
        ItemSeparatorComponent={() => <Separator />}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchChats} />
        }
    />
    </>
);
};

let styles = StyleSheet.create({
  container: {
    padding: 15,
  },
});

export default Chats;
