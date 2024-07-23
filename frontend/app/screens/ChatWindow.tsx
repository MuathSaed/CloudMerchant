import AppHeader from "@components/AppHeader";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import BackButton from "@ui/BackButton";
import EmptyChatContainer from "@ui/EmptyChatContainer";
import EmptyView from "@ui/EmptyView";
import PeerProfile from "@ui/PeerProfile";
import { fetchDataAsync } from "app/api/fetchDataAsync";
import axios from "axios";
import useAuth from "app/hooks/useAuth";
import useClient from "app/hooks/useClient";
import { AppStackParamList } from "app/navigator/AppNavigator";
import socket, { NewMessageResponse } from "app/socket";
import { Conversation, addConversation, selectConversationById, updateConversation } from "app/store/conversation";
import { FC, useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { useDispatch, useSelector } from "react-redux";
import { LogBox } from 'react-native';


let client = axios.create({ baseURL: "https://cloud-merchant-gp1.ew.r.appspot.com" });

LogBox.ignoreLogs([
  'Warning: Avatar: Support for defaultProps will be removed from function components',
]);

type Props = NativeStackScreenProps<AppStackParamList, "ChatWindow">;

type OutGoingMessage = {
  message: {
    id: string;
    time: string;
    text: string;
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
  };
  to: string;
  conversationId: string;
};

let getTime = (value: IMessage["createdAt"]) => {
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
};

let generateUniqueId = () => {
  return (
    new Date().getTime().toString(36) +
    Math.random().toString(36).substr(2, 9)
  );
};

let formatConversationToIMessage = (value?: Conversation): IMessage[] => {
  let formattedValues = value?.chats.map((chat) => {
    return {
      _id: `${chat.id}-${generateUniqueId()}`,
      text: chat.text,
      createdAt: new Date(chat.time),
      received: chat.viewed,
      user: {
        _id: chat.user.id,
        name: chat.user.name,
        avatar: chat.user.avatar,
      },
    };
  });

  let messages = formattedValues || [];

  return messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

let ChatWindow: FC<Props> = ({ route }) => {
  let { authState } = useAuth();
  let { conversationId, peerProfile } = route.params;
  let conversation = useSelector(selectConversationById(conversationId));
  let dispatch = useDispatch();
  let { authClient } = useClient();
  let [fetchingChats, setFetchingChats] = useState(false);

  let profile = authState.profile;

  let sendPushNotification = async (userId: string | undefined, title: string, body: string) => {
    if (!userId) return;
    console.log('Sending push notification to:', userId);
  
    try {
      await client.post('/send-notification', {
        userId: userId,
        title: title,
        body: body,
      });
      console.log('Push notification sent successfully');
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  };

  let handleOnMessageSend = (messages: IMessage[]) => {
    if (!profile) return;

    let currentMessage = messages[messages.length - 1];

    let newMessage: OutGoingMessage = {
      message: {
        id: currentMessage._id.toString(),
        text: currentMessage.text,
        time: getTime(currentMessage.createdAt),
        user: { id: profile.id, name: profile.name, avatar: profile.avatar },
      },
      conversationId,
      to: peerProfile.id,
    };

    dispatch(
      updateConversation({
        conversationId,
        chat: { ...newMessage.message, viewed: false },
        peerProfile,
      })
    );

    socket.emit("chat:new", newMessage);
    sendPushNotification(peerProfile.id, profile.name, currentMessage.text);
  };

  let fetchOldChats = async () => {
    setFetchingChats(true);
    let res = await fetchDataAsync<{ conversation: Conversation }>(
      authClient("/conversation/chats/" + conversationId)
    );
    setFetchingChats(false);

    if (res?.conversation) {
      dispatch(addConversation([res.conversation]));
    }
  };

  let sendSeenRequest = () => {
    fetchDataAsync(
      authClient.patch(`/conversation/seen/${conversationId}/${peerProfile.id}`)
    );
  };

  useEffect(() => {
    let handleApiRequest = async () => {
      await fetchOldChats();
      await sendSeenRequest();
    };

    handleApiRequest();
    
  }, []);

  useFocusEffect(
    useCallback(() => {
      let updateSeenStatus = (data: NewMessageResponse) => {
        socket.emit("chat:seen", {
          messageId: data.message.id,
          conversationId,
          peerId: peerProfile.id,
        });
      };

      socket.on("chat:message", updateSeenStatus);

      return () => socket.off("chat:message", updateSeenStatus);
    }, [])
  );

  if (!profile) return null;

  if (fetchingChats) return <EmptyView title="Please wait..." />;

  return (
    <View style={styles.container}>
      <AppHeader
        backButton={<BackButton />}
        center={<PeerProfile name={peerProfile.name} avatar={peerProfile.avatar} />}
      />

      <GiftedChat
        messages={formatConversationToIMessage(conversation)}
        user={{
          _id: profile.id,
          name: profile.name,
          avatar: profile.avatar,
        }}
        onSend={handleOnMessageSend}
        renderChatEmpty={() => <EmptyChatContainer />}
      />
    </View>
  );
};

let styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ChatWindow;
