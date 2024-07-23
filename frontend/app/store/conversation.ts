import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from ".";

interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
}

interface Chat {
  text: string;
  time: string;
  id: string;
  viewed: boolean;
  user: UserProfile;
}

export interface Conversation {
  id: string;
  chats: Chat[];
  peerProfile: { avatar?: string; name: string; id: string };
}

type UpdatePayload = {
  chat: Chat;
  conversationId: string;
  peerProfile: UserProfile;
};

interface InitialState {
  conversations: Conversation[];
}

let initialState: InitialState = {
  conversations: [],
};

let slice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    addConversation(
      state,
      { payload }: PayloadAction<InitialState["conversations"]>
    ) {
      state.conversations = payload;
    },
    updateChatViewed(
      state,
      { payload }: PayloadAction<{ messageId: string; conversationId: string }>
    ) {
      let index = state.conversations.findIndex(
        ({ id }) => id === payload.conversationId
      );

      if (index !== -1) {
        state.conversations[index].chats.map((chat) => {
          if (chat.id === payload.messageId) {
            chat.viewed = true;
          }
          return chat;
        });
      }
    },
    updateConversation(
      { conversations },
      { payload }: PayloadAction<UpdatePayload>
    ) {
      let index = conversations.findIndex(
        ({ id }) => id === payload.conversationId
      );
      if (index === -1) {
        conversations.push({
          id: payload.conversationId,
          chats: [payload.chat],
          peerProfile: payload.peerProfile,
        });
      } else {
        conversations[index].chats.push(payload.chat);
      }
    },
  },
});

export let { addConversation, updateChatViewed, updateConversation } =
  slice.actions;

export let selectConversationById = (conversationId: string) => {
  return createSelector(
    (state: RootState) => state,
    ({ conversation }) => {
      return conversation.conversations.find(({ id }) => id === conversationId);
    }
  );
};

export default slice.reducer;
