import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from ".";
import { Product } from "./listings";

export interface CartItem {
 _id: string;
 product: Product;
 quantity: number;
}

export interface CartState {
 cartItems: CartItem[];
}

let initialState: CartState = {
 cartItems: [],
};

let cartSlice = createSlice({
 name: "cart",
 initialState,
 reducers: {
   setCartItems: (state, action: PayloadAction<CartItem[]>) => {
     state.cartItems = action.payload;
   },
 },
});

export let { setCartItems } = cartSlice.actions;

export default cartSlice.reducer;
