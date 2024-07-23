import { Document, ObjectId, Schema, model } from "mongoose";

interface CartDocument extends Document {
  owner: ObjectId;
  product: ObjectId;
  quantity: number;
}

let schema = new Schema<CartDocument>({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

let CartModel = model("Cart", schema);

export default CartModel;