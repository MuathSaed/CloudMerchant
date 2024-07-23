import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from ".";

export type Profile = {
  id: string;
  email: string;
  name: string;
  role: string;
  verified: boolean;
  avatar?: string;
  accessToken: string;
  address?: string;
  city?: string;
  location?: { latitude: number; longitude: number };
  notificationToken?: string;
};

interface AuthState {
  profile: null | Profile;
  pending: boolean;
}

let initialState: AuthState = {
  pending: false,
  profile: null,
};

let authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateAuthState(authState, { payload }: PayloadAction<AuthState>) {
      authState.pending = payload.pending;
      authState.profile = payload.profile;
    },
  },
});

export let { updateAuthState } = authSlice.actions;

export let getAuthState = createSelector(
  (state: RootState) => state,
  (state) => state.auth
);

export default authSlice.reducer;
