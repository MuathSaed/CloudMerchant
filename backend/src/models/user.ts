import { Document, Schema, model } from "mongoose";
import { hash, compare, genSalt } from "bcrypt";

export interface UserDocument extends Document {
  email: string;
  password: string;
  name: string;
  role: string;
  verified: boolean;
  approved?: boolean;
  tokens: string[];
  avatar?: { url: string; id: string };
  address?: string;
  city?: string;
  location?: { latitude: number; longitude: number };
  description?: string;
  image?: { url: string; id: string };
  notificationToken?: string;
}

interface Methods {
  comparePassword: (password: string) => Promise<boolean>;
}

let userSchema = new Schema<UserDocument, {}, Methods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    approved: {
      type: Boolean,
    },
    tokens: {
      type: [String],
    },
    avatar: {
      type: Object,
      url: String,
      id: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    location: {
      type: Object,
      latitude: Number,
      longitude: Number,
    },
    description: {
      type: String,
    },
    image: {
      type: Object,
      url: String,
      id: String,
    },
    notificationToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    let salt = await genSalt(10);
    this.password = await hash(this.password, salt);
  }
  next();
});

userSchema.methods.comparePassword = async function (password: string) {
  return await compare(password, this.password);
};

let UserModel =  model("User", userSchema);
export default UserModel;