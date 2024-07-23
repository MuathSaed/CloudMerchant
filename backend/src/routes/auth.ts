import { Router } from "express";
import { addNewUser, authenticateUser, authenticateEmail, fetchProfile, createVerificationLink, generateAccessToken, handleSignOut, createResetLink, validateGrant, modifyUserPassword, updateUserDetails, fetchPublicProfile, modifyAvatar, deleteAccount, fetchUsers, authenticateAdmin, updateUserApproval, handleNotificationsTokenUpdate } from "controllers/auth";
import validate from "src/middleware/validate";
import { newUserSchema, resetPassSchema, updatePassSchema, verifyTokenSchema } from "src/utils/validateSchema";
import { isAdmin, isAuth, isValidPassResetToken } from "src/middleware/auth";
import processFileUpload from "src/middleware/processFileUpload";

let authRouter = Router();

authRouter.post("/sign-up", processFileUpload, validate(newUserSchema), addNewUser);
authRouter.post("/verify", validate(verifyTokenSchema), authenticateEmail);
authRouter.get("/verify-token", isAuth, createVerificationLink);
authRouter.patch("/approve/:id", isAuth, isAdmin, updateUserApproval);
authRouter.put("/fcm/:id", handleNotificationsTokenUpdate);
authRouter.post("/sign-in", authenticateUser);
authRouter.post("/sign-in-admin", authenticateAdmin);
authRouter.get("/profile", isAuth, fetchProfile);
authRouter.post("/refresh-token", generateAccessToken);
authRouter.post("/sign-out", isAuth, handleSignOut);
authRouter.post("/forget-pass", createResetLink);
authRouter.post("/verify-pass-reset-token", validate(verifyTokenSchema), isValidPassResetToken, validateGrant);
authRouter.post("/reset-pass", validate(resetPassSchema), isValidPassResetToken, modifyUserPassword);
authRouter.post("/update-password", validate(updatePassSchema), modifyUserPassword);
authRouter.patch("/update-profile", isAuth, updateUserDetails);
authRouter.patch("/update-avatar", isAuth, processFileUpload, modifyAvatar);
authRouter.get("/profile/:id", isAuth, fetchPublicProfile);
authRouter.get("/all", isAuth, isAdmin, fetchUsers);
authRouter.delete("/remove/:id", isAuth, isAdmin, deleteAccount);

export default authRouter;