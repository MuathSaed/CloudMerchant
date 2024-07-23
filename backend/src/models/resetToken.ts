import { Document, Schema, model } from "mongoose";
import { hash, compare, genSalt } from "bcrypt";

interface ResetTokenDocument extends Document {
  owner: Schema.Types.ObjectId;
  token: string;
  createdAt: Date;
}

interface Methods {
  compareToken: (token: string) => Promise<boolean>;
}

let resetTokenSchema = new Schema<ResetTokenDocument, {}, Methods>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      expires: 3600,
      default: Date.now(),
    },
  }
);

resetTokenSchema.pre("save", async function (next) {
  if (this.isModified("token")) {
    let salt = await genSalt(10);
    this.token = await hash(this.token, salt);
  }
  next();
});

resetTokenSchema.methods.compareToken = async function (token: string) {
  return await compare(token, this.token);
};
 

let ResetTokenModel = model("PasswordResetToken", resetTokenSchema);
export default ResetTokenModel;
