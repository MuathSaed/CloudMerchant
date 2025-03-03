import { RequestHandler } from "express";
import { ObjectId, Types, isValidObjectId } from "mongoose";
import ConversationModel from "src/models/conversation";
import UserModel from "src/models/user";

interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
}

interface Chat {
  text: string;
  time: string;
  id: string;
  user: UserProfile;
}

interface Conversation {
  id: string;
  chats: Chat[];
  peerProfile: { avatar?: string; name: string; id: string };
}

type PopulatedChat = {
  _id: ObjectId;
  content: string;
  timestamp: Date;
  viewed: boolean;
  sentBy: { name: string; _id: ObjectId; avatar?: { url: string } };
};

type PopulatedParticipant = {
  _id: ObjectId;
  name: string;
  avatar?: { url: string };
};

export let fetchOrCreateConversation: RequestHandler = async (req, res) => {
  let { peerId } = req.params;

  if (!isValidObjectId(peerId)) {
    return res.status(422).json({ error: "Invalid peer id!" });
  }

  let user = await UserModel.findById(peerId);
  if (!user) {
    return res.status(404).json({ error: "User not found!" });
  }

  let participants = [req.user.id, peerId];
  let participantsId = participants.sort().join("_");

  let conversation = await ConversationModel.findOneAndUpdate(
    { participantsId },
    {
      $setOnInsert: {
        participantsId,
        participants,
      },
    },
    { upsert: true, new: true }
  );

  res.json({ conversationId: conversation._id });
};

export let fetchConversations: RequestHandler = async (req, res) => {
  let { conversationId } = req.params;

  if (!isValidObjectId(conversationId)) {
    return res.status(422).json({ error: "Invalid conversation id!" });
  }

  let conversation = await ConversationModel.findById(conversationId)
    .populate<{ chats: PopulatedChat[] }>({
      path: "chats.sentBy",
      select: "name avatar.url",
    })
    .populate<{ participants: PopulatedParticipant[] }>({
      path: "participants",
      match: { _id: { $ne: req.user.id } },
      select: "name avatar.url",
    })
    .select(
      "sentBy chats._id chats.content chats.timestamp chats.viewed participants"
    );

  if (!conversation) return res.status(404).json({ error: "Conversation not found!" });

  let peerProfile = conversation.participants[0];

  let finalConversation: Conversation = {
    id: conversation._id as string,
    chats: conversation.chats.map((c) => ({
      id: c._id.toString(),
      text: c.content,
      time: c.timestamp.toISOString(),
      viewed: c.viewed,
      user: {
        id: c.sentBy._id.toString(),
        name: c.sentBy.name,
        avatar: c.sentBy.avatar?.url,
      },
    })),
    peerProfile: {
      id: peerProfile._id.toString(),
      name: peerProfile.name,
      avatar: peerProfile.avatar?.url,
    },
  };

  res.json({ conversation: finalConversation });
};

export let fetchLatestConversations: RequestHandler = async (req, res) => {
  let chats = await ConversationModel.aggregate([
    {
      $match: { participants: req.user.id },
    },
    {
      $lookup: {
        from: "users",
        localField: "participants",
        foreignField: "_id",
        as: "participantsInfo",
      },
    },
    {
      $project: {
        _id: 0,
        id: "$_id",
        participants: {
          $filter: {
            input: "$participantsInfo",
            as: "participant",
            cond: { $ne: ["$$participant._id", req.user.id] },
          },
        },
        lastChat: {
          $slice: ["$chats", -1],
        },
        unreadChatCounts: {
          $size: {
            $filter: {
              input: "$chats",
              as: "chat",
              cond: {
                $and: [
                  { $eq: ["$$chat.viewed", false] },
                  { $ne: ["$$chat.sentBy", req.user.id] },
                ],
              },
            },
          },
        },
      },
    },
    {
      $unwind: "$participants",
    },
    {
      $unwind: "$lastChat",
    },
    {
      $project: {
        id: "$id",
        lastMessage: "$lastChat.content",
        timestamp: "$lastChat.timestamp",
        unreadChatCounts: "$unreadChatCounts",
        peerProfile: {
          id: "$participants._id",
          name: "$participants.name",
          avatar: "$participants.avatar.url",
        },
      },
    },
  ]);

  res.json({ chats });
};

export let markChatAsViewed = async (peerId: string, conversationId: string) => {
  await ConversationModel.findByIdAndUpdate(
    conversationId,
    { $set: { "chats.$[elem].viewed": true }},
    { arrayFilters: [{ "elem.sentBy": peerId }]}
  );
};

export let updateChatSeenStatus: RequestHandler = async (req, res) => {
  let { peerId, conversationId } = req.params;

  if (!isValidObjectId(peerId) || !isValidObjectId(conversationId))
    return res.status(422).json({ error: "Invalid conversation or peer id!" });

  await markChatAsViewed(peerId, conversationId);

  res.json({ message: "Updated successfully." });
};