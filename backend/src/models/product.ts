import { Document, Schema, model } from "mongoose";

let categories = ["Foodstuffs", "Handicrafts"];
type productImage = { url: string; id: string };

export interface ProductDocument extends Document {
  owner: Schema.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  category: string;
  images?: productImage[];
  thumbnail?: string;
  description: string;
}

let schema = new Schema<ProductDocument>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: [...categories.sort()],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    images: [
      {
        type: Object,
        url: String,
        id: String,
      },
    ],
    thumbnail: String,
  },
  { timestamps: true }
);

let ProductModel = model("Product", schema);

export default ProductModel;