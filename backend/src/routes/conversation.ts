import { Router } from "express";
import { fetchConversations, fetchLatestConversations, fetchOrCreateConversation, updateChatSeenStatus } from "src/controllers/conversation";
import { isAuth } from "src/middleware/auth";

let conversationRouter = Router();

conversationRouter.get("/with/:peerId", isAuth, fetchOrCreateConversation);
conversationRouter.get("/chats/:conversationId", isAuth, fetchConversations);
conversationRouter.get("/last-chats", isAuth, fetchLatestConversations);
conversationRouter.patch("/seen/:conversationId/:peerId", isAuth, updateChatSeenStatus);

export default conversationRouter;