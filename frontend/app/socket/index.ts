import axios from "axios";
import { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import asyncStorage, { Keys } from "@utils/asyncStorage";
import { fetchDataAsync } from "app/api/fetchDataAsync";
import { TokenResponse } from "app/hooks/useClient";
import { Profile, updateAuthState } from "app/store/auth";
import { updateActiveChat } from "app/store/chats";
import { updateChatViewed, updateConversation } from "app/store/conversation";

import { io } from "socket.io-client";

let client = axios.create({ baseURL: "https://cloud-merchant-gp1.ew.r.appspot.com" });

let socket = io("https://cloud-merchant-gp1.ew.r.appspot.com", { path: "/socket-message", autoConnect: false });

type MessageProfile = {
  id: string;
  name: string;
  avatar?: string;
};

export type NewMessageResponse = {
  message: {
    id: string;
    time: string;
    text: string;
    user: MessageProfile;
    viewed: boolean;
  };
  from: MessageProfile;
  conversationId: string;
};

type SeenData = {
  messageId: string;
  conversationId: string;
};

export let handleSocketConnection = (
  profile: Profile,
  dispatch: Dispatch<UnknownAction>
) => {
  socket.auth = { token: profile.accessToken };
  socket.connect();

  socket.on("chat:message", (data: NewMessageResponse) => {
    let { conversationId, from, message } = data;
    dispatch(
      updateConversation({
        conversationId,
        chat: message,
        peerProfile: from,
      })
    );
    dispatch(
      updateActiveChat({
        id: data.conversationId,
        lastMessage: data.message.text,
        peerProfile: data.message.user,
        timestamp: data.message.time,
        unreadChatCounts: 1,
      })
    );
  });

  socket.on("chat:seen", (seenData: SeenData) => {
    dispatch(updateChatViewed(seenData));
  });

  socket.on("connect_error", async (error) => {
    if (error.message === "jwt expired") {
      let refreshToken = await asyncStorage.get(Keys.REFRESH_TOKEN);
      let res = await fetchDataAsync<TokenResponse>(
        client.post("https://cloud-merchant-gp1.ew.r.appspot.com/auth/refresh-token", { refreshToken })
      );

      if (res) {
        await asyncStorage.save(Keys.AUTH_TOKEN, res.tokens.access);
        await asyncStorage.save(Keys.REFRESH_TOKEN, res.tokens.refresh);
        dispatch(
          updateAuthState({
            profile: { ...profile, accessToken: res.tokens.access },
            pending: false,
          })
        );
        socket.auth = { token: res.tokens.access };
        socket.connect();
      }
    }
  });
};

export default socket;
