import { Document, Schema, model } from "mongoose";
import { hash, compare, genSalt } from "bcrypt";

interface VerifyTokenDocument extends Document {
  owner: Schema.Types.ObjectId;
  token: string;
  createdAt: Date;
}

interface Methods {
  compareToken: (token: string) => Promise<boolean>;
}

let verifyTokenSchema = new Schema<VerifyTokenDocument, {}, Methods>(
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
      expires: 86400,
      default: Date.now(),
    },
  }
);

verifyTokenSchema.pre("save", async function (next) {
  if (this.isModified("token")) {
    let salt = await genSalt(10);
    this.token = await hash(this.token, salt);
  }
  next();
});

verifyTokenSchema.methods.compareToken = async function (token: string) {
  return await compare(token, this.token);
};


let VerifyTokenModel = model("AuthVerificationToken", verifyTokenSchema);
export default VerifyTokenModel;
