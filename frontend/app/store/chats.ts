import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from ".";

export interface ActiveChat {
  id: string;
  lastMessage: string;
  timestamp: string;
  unreadChatCounts: number;
  peerProfile: { id: string; name: string; avatar?: string };
}

let initialState: ActiveChat[] = [];

let slice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    addNewActiveChats(state, { payload }: PayloadAction<ActiveChat[]>) {
      return payload;
    },
    removeUnreadChatCount(chats, { payload }: PayloadAction<string>) {
      let index = chats.findIndex((chat) => chat.id === payload);
      if (index !== -1) {
        chats[index].unreadChatCounts = 0;
      }
    },
    updateActiveChat(chats, { payload }: PayloadAction<ActiveChat>) {
      let index = chats.findIndex((chat) => chat.id === payload.id);
      if (index === -1) {
        chats.push(payload);
      } else {
        let chat = chats[index];
        chat.lastMessage = payload.lastMessage;
        chat.timestamp = payload.timestamp;
        chat.unreadChatCounts =
          chat.unreadChatCounts + payload.unreadChatCounts;
      }
    },
  },
});

export let { addNewActiveChats, updateActiveChat, removeUnreadChatCount } =
  slice.actions;

export let getActiveChats = createSelector(
  (state: RootState) => state,
  ({ chats }) => chats
);

export let getUnreadChatsCount = createSelector(
  (state: RootState) => state,
  ({ chats }) => {
    return chats.reduce((previousValue, currentValue) => {
      return previousValue + currentValue.unreadChatCounts;
    }, 0);
  }
);

export default slice.reducer;
