import { Document, Schema, model, Types } from "mongoose";

interface OrderItem {
  product: Types.ObjectId; 
  quantity: number;
}

interface OrderDocument extends Document {
  user: Types.ObjectId;
  name: string; 
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  paymentMethod: string;
  paymentIntentId: string;
  status: string;
  notificationToken?: string;
  createdAt: Date; 
  updatedAt: Date; 
}

let orderSchema = new Schema<OrderDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  items: [
    {
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
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  shippingAddress: {
    type: String, 
    required: true,
  },
  location: {
    latitude: {
      type: Number,
      required: true,
      },
      longitude: {
      type: Number,
      required: true,
      },
    },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["Cash on Delivery", "Online Payment"],
  },
  paymentIntentId: {
    type: String, 
  },
  status: {
    type: String,
    enum: ["Pending", "Out to Delivery", "Near You", "Delivered", "Cancelled"],
    default: "Pending",
  },
  notificationToken: {
    type: String,
  },
}, { timestamps: true });

let OrderModel = model<OrderDocument>('Order', orderSchema);

export default OrderModel;