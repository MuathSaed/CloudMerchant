import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from ".";

export type Order = {
  _id: string;
  user: string;
  name: string;
  items: {
    product: {
      _id: string;
      name: string;
      thumbnail: string;
      price: number;
    };
    quantity: number;
  }[];
  totalAmount: number;
  shippingAddress: {
    address: string;
    city: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  paymentIntentId: string;
  paymentMethod: string;
  notificationToken: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

let initialState: Order[] = [];

let slice = createSlice({
  name: "order",
  initialState,
  reducers: {
    updateOrders(_, { payload }: PayloadAction<Order[]>) {
      return payload;
    },
  },
});

export let { updateOrders } = slice.actions;

export let getOrders = createSelector(
  (state: RootState) => state,
  (state) => state.order
);

export default slice.reducer;