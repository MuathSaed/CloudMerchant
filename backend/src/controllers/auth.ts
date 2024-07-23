import { RequestHandler } from "express";
import UserModel from "src/models/user";
import crypto from "crypto";
import VerifyTokenModel from "src/models/VerifyToken";
import jwt from "jsonwebtoken";
import mail from "src/utils/mail";
import ResetTokenModel from "src/models/resetToken";
import {v2, UploadApiResponse} from "cloudinary";
import { isValidObjectId } from "mongoose";

let JWT_SECRET = process.env.JWT_SECRET!;
let CLOUD_NAME = process.env.CLOUD_NAME!;
let CLOUD_KEY = process.env.CLOUD_KEY!;
let CLOUD_SECRET = process.env.CLOUD_SECRET!;
//let localAddress = `http://${process.env.IP_ADDRESS}:${process.env.PORT}/`;
let serverAddress = "https://cloud-merchant-gp1.ew.r.appspot.com/";

v2.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_KEY,
  api_secret: CLOUD_SECRET,
  secure: true,
});

let uploadImage = (filePath: string): Promise<UploadApiResponse> => {
  return v2.uploader.upload(filePath, {
    width: 1280,
    height: 720,
    crop: "fill",
  });
};

export let addNewUser: RequestHandler = async (req, res) => {
  let saveImage;
  let { email, password, name, role, address, city, longitude, latitude, description } = req.body;

  console.log(longitude, latitude);
   
  try {
    let { image } = req.files;
    saveImage = image;
  } catch (error) {}

  let existingUser = await UserModel.findOne({ email });

    if (existingUser) return res.status(403).json({ message: "User already exists." });

    let user, newImage;

    if (saveImage) {
      let { secure_url, public_id } = await uploadImage(Array.isArray(saveImage) ? saveImage[0].filepath : saveImage.filepath);
      newImage = { url: secure_url, id: public_id };
    }

    if (role === "Buyer") {
      user = await UserModel.create({ email, password, name, role, address, city, location: {longitude: longitude, latitude: latitude } });
    } else if (role === "Seller") {
      user = await UserModel.create({ email, password, name, role, description, image: newImage });
    } else {
      user = await UserModel.create({ email, password, name, role, image: newImage });
    }
    
    let token = crypto.randomBytes(36).toString("hex");
    await VerifyTokenModel.create({ owner: user._id, token });

    // let link = `https://cloud-merchant-gp1.ew.r.appspot.com/verify.html?id=${user._id}&token=${token}`;
    let link = serverAddress + `verify.html?id=${user._id}&token=${token}`;

    await mail.sendVerificationEmail(user.name, user.email, link);

    res.json({ message: "Check your email.", link });
};

export let authenticateEmail: RequestHandler = async (req, res) => {
    let { id, token } = req.body;

    let authToken = await VerifyTokenModel.findOne({ owner: id });
    if (!authToken) return res.status(403).json({ message: "Unauthorized Request, Invalid Token" });

    let isMatched = await authToken.compareToken(token);
    if (!isMatched) return res.status(403).json({ message: "Unauthorized Request, Invalid Token" });

    await UserModel.findByIdAndUpdate(id, { verified: true });

    await VerifyTokenModel.findByIdAndDelete(authToken._id);

    res.json({ message: "Email verified successfully" });
}

export let createVerificationLink: RequestHandler = async (req, res) => {
    let { id } = req.user;
    let token = crypto.randomBytes(36).toString("hex");

    // let link = `https://cloud-merchant-gp1.ew.r.appspot.com/verify.html?id=${id}&token=${token}`;
    let link = serverAddress + `verify.html?id=${id}&token=${token}`;

    await VerifyTokenModel.findOneAndDelete({ owner: id });

    await VerifyTokenModel.create({ owner: id, token });

    await mail.sendVerificationEmail(req.user.name, req.user.email, link);

    res.json({ message: "Check your email.", link });
}

export let authenticateUser: RequestHandler = async (req, res) => {
    console.log('Received sign-in request:', req.body);
    let { email, password } = req.body;

    let user = await UserModel.findOne({ email });
    if (!user) return res.status(403).json({ message: "Unauthorized Request, User not found." });

    if (user.role === "Seller" && !user.approved) return res.status(403).json({ message: "Unauthorized Request, User not approved." });
    if (user.role === "Driver" && !user.approved) return res.status(403).json({ message: "Unauthorized Request, User not approved." });

    let isMatched = await user.comparePassword(password);
    if (!isMatched) return res.status(403).json({ message: "Unauthorized Request, Invalid Credentials." });

    let payload = { id: user._id, email: user.email, name: user.name };

    let accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });

    let refreshToken = jwt.sign(payload, JWT_SECRET);

    if (!user.tokens) user.tokens = [refreshToken];
    else user.tokens.push(refreshToken);

    await user.save();

    res.json({ 
      profile: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          verified: user.verified,
          address: user.address,
          city: user.city,
          location: user.location,
          notificationToken: user.notificationToken,
      },
      tokens: { refresh: refreshToken, access: accessToken } 
     });
}

export let authenticateAdmin: RequestHandler = async (req, res) => {
  console.log('Received sign-in request:', req.body);
  let { email, password } = req.body;

  let user = await UserModel.findOne({ email });
  if (!user) return res.status(403).json({ message: "Unauthorized Request, User not found." });

  let isMatched = await user.comparePassword(password);
  if (!isMatched) return res.status(403).json({ message: "Unauthorized Request, Invalid Credentials." });

  if (user.role !== "Admin") return res.status(403).json({ message: "Unauthorized Request, User not an Admin." });

  let payload = { id: user._id, email: user.email, name: user.name };

  let accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });

  let refreshToken = jwt.sign(payload, JWT_SECRET);

  if (!user.tokens) user.tokens = [refreshToken];
  else user.tokens.push(refreshToken);

  await user.save();

  res.json({ 
    profile: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        verified: user.verified,
        address: user.address,
        city: user.city,
        location: user.location,
    },
    tokens: { refresh: refreshToken, access: accessToken } 
   });
}    

export let fetchProfile: RequestHandler = async (req, res) => {
    res.json({ profile: req.user });
}

export let generateAccessToken: RequestHandler = async (req, res) => {
    let { refreshToken } = req.body;

    if (!refreshToken) return res.status(401).json({ message: "Unauthorized Request!" });

    let payload = jwt.verify(refreshToken, JWT_SECRET) as { id: string; };

    if (!payload.id) return res.status(401).json({ message: "Unauthorized Request!" });

    let user = await UserModel.findOne({
      _id: payload.id,
      tokens: refreshToken
    });

    if (!user) {
        await UserModel.findByIdAndUpdate(payload.id, { tokens: refreshToken });
        return res.status(401).json({ message: "Unauthorized Request!" });
    }

    let newAccessToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "2 days" });
    let newRefreshToken = jwt.sign({ id: user._id }, JWT_SECRET);

    user.tokens = user.tokens.filter((token) => token !== refreshToken);
    user.tokens.push(newRefreshToken);

    await user.save();

    res.json({ tokens: { refresh: newRefreshToken, access: newAccessToken } });
    
}

export let handleSignOut: RequestHandler = async (req, res) => {
    console.log('Received sign-in request:', req.body);
    let { refreshToken } = req.body;
    let user = await UserModel.findOne({
      _id: req.user.id,
      tokens: refreshToken
    });

    if (!user) return res.status(401).json({ message: "Unauthorized Request!" });

    user.tokens = user.tokens.filter((token) => token !== refreshToken);
    await user.save();

    res.send("Logged out successfully");
}

export let createResetLink: RequestHandler = async (req, res) => {
    let { email } = req.body;
    let user = await UserModel.findOne({ email });

    if (!user) return res.status(403).json({ message: "User not found!" });

    await ResetTokenModel.findOneAndDelete({ owner: user._id });

    let token = crypto.randomBytes(36).toString("hex");
    await ResetTokenModel.create({ owner: user._id, token });

    // let passResetLink = `https://cloud-merchant-gp1.ew.r.appspot.com/reset-password.html?id=${user._id}&token=${token}`;
    let passResetLink = serverAddress + `reset-password.html?id=${user._id}&token=${token}`;

    await mail.sendPasswordRestLink(user.name, user.email, passResetLink);

    res.json({ message: "Check your email.", link: passResetLink });
}

export let validateGrant: RequestHandler = async (req, res) => {
  res.json({ valid: true});
}

export let modifyUserPassword: RequestHandler = async (req, res) => {
  console.log('Received password update request:', req.body);
    let { id, password } = req.body;

    let user = await UserModel.findById(id);
    if (!user) return res.status(403).json({ message: "User not found!" });

    let isMatched = await user.comparePassword(password);
    if (isMatched) return res.status(403).json({ message: "New password cannot be the same as the old password!" });
    
    user.password = password;
    await user.save();

    await ResetTokenModel.findOneAndDelete({owner: user._id});

    await mail.sendPasswordUpdateMessage(user.name, user.email);

    res.json({ message: "Password reset successfully" });
}

export let updateUserDetails: RequestHandler = async (req, res) => {
    let { email, name, address, city, longitude, latitude } = req.body;

    if (typeof name !== "string" || name.trim().length < 3) {
      return res.status(422).json({ message: "Invalid name!" });
    }

    let user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (user.role === "Buyer") {
        await UserModel.findByIdAndUpdate(req.user.id, { name, email, address, city, location: {longitude: longitude, latitude: latitude } });
    } else {
        await UserModel.findByIdAndUpdate(req.user.id, { name, email });
    }

    if (email !== user.email) {
      let token = crypto.randomBytes(36).toString("hex");
      // let link = `https://cloud-merchant-gp1.ew.r.appspot.com/verify.html?id=${user._id}&token=${token}`;
      let link = serverAddress + `verify.html?id=${user._id}&token=${token}`;


      await VerifyTokenModel.findOneAndDelete({ owner: user._id });
      await VerifyTokenModel.create({ owner: user._id, token });
      await mail.sendVerificationEmail(req.user.name, req.user.email, link);
      user.verified = false;
      await user.save();
    }

    res.json({ message: "Profile updated successfully" });
}

export let modifyAvatar: RequestHandler = async (req, res) => {

    let { avatar } = req.files;
    if (Array.isArray(avatar)) {
      return res.status(422).json({ message: "Multiple files are not allowed!" });
    }
  
    if (!avatar.mimetype?.startsWith("image")) {
      return res.status(422).json({ message: "File is not an image!" });
    }
  
    let user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
  
    if (user.avatar?.id) {
      await v2.uploader.destroy(user.avatar.id);
    }

    let { secure_url: url, public_id: id } = await v2.uploader.upload(
      avatar.filepath,
      {
        width: 300,
        height: 300,
        crop: "thumb",
        gravity: "face",
      }
    );
    user.avatar = { url, id };
    await user.save();
  
    res.json({ profile: { ...req.user, avatar: user.avatar.url } });
  };
  
  export let fetchPublicProfile: RequestHandler = async (req, res) => {
    let profileId = req.params.id;
    if (!isValidObjectId(profileId)) {
      return res.status(422).json({ message: "Invalid profile ID." });
    }
  
    let user = await UserModel.findById(profileId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
  
    res.json({
      profile: { id: user._id, name: user.name, avatar: user.avatar?.url },
    });
  };

  export let fetchUsers: RequestHandler = async (req, res) => {
    try {
      let users = await UserModel.find({});
      res.json({ users });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch users." });
    }
  };
  
  export let deleteAccount: RequestHandler = async (req, res) => {
    let userId = req.params.id;
    if (!isValidObjectId(userId)) {
      return res.status(422).json({ message: "Invalid user ID." });
    }
  
    try {
      let deletedUser = await UserModel.findByIdAndDelete(userId);
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found." });
      }
      res.json({ message: "User deleted successfully." });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete user." });
    }
  };

  export let updateUserApproval: RequestHandler = async (req, res) => {
    let userId = req.params.id;
    if (!isValidObjectId(userId)) {
      return res.status(422).json({ message: "Invalid user ID." });
    }
  
    try {
      let user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      user.approved = true;
      await user.save();
  
      res.json({ message: "User approved successfully." });
    } catch (error) {
      return res.status(500).json({ message: "Failed to approve user." });
    }
  };

  export let handleNotificationsTokenUpdate: RequestHandler = async (req, res) => {
    console.log('Received notification token update request:', req.body);
    let userId = req.params.id;

    let { notificationToken } = req.body;

    if (!isValidObjectId(userId)) {
      return res.status(422).json({ message: "Invalid user ID." });
    }
  
    try {
      let user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      user.notificationToken = notificationToken;
      await user.save();
  
      res.json({ message: "Notification token updated successfully." });
    } catch (error) {
      return res.status(500).json({ message: "Failed to update notification token." });
    }
  };