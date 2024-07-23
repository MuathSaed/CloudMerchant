import "dotenv/config";
import "express-async-errors";
import express from 'express';
import cors from 'cors';
import authRouter from "routes/auth";
import http from "http";
import productRouter from "routes/product";
import { Server } from "socket.io";
import { TokenExpiredError, verify } from "jsonwebtoken";
import morgan from "morgan";
import conversationRouter from "./routes/conversation";
import ConversationModel from "./models/conversation";
import { markChatAsViewed } from "./controllers/conversation";
import cartRouter from "./routes/cart";
import orderRouter from "./routes/order";
import notificationRouter from "./routes/notification";
import { connect } from "mongoose";

let app = express();
let ipAddress = process.env.IP_ADDRESS;
let server = http.createServer(app);
let io = new Server(server, {
  path: "/socket-message",
});

let uri = process.env.CLOUD_DB_URI!;

let msg = "Initializing..." ;

connect(uri).then(() => {
    console.log("Connected to MongoDB");
    msg = "Connected to MongoDB";
}).catch((err) => {
    console.error(err);
    msg = err as string;
});


app.use(morgan("dev"));
app.use(express.static('src/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://cloudmerchant.azurewebsites.net'
  ],
  credentials: true
};

app.use(cors(corsOptions)); 

// API Routes
app.use("/auth", authRouter);
app.use("/product", productRouter);
app.use("/conversation", conversationRouter);
app.use("/cart", cartRouter);
app.use("/order", orderRouter);
app.use('/send-notification', notificationRouter);

app.get('/', (req, res) => {
  res.send('Hello World! ' + msg);
});

io.use((socket, next) => {
  let socketReq = socket.handshake.auth as { token: string } | undefined;
  if (!socketReq?.token) {
    return next(new Error("Unauthorized request!"));
  }

  try {
    socket.data.jwtDecode = verify(socketReq.token, process.env.JWT_SECRET!);
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return next(new Error("jwt expired"));
    }

    return next(new Error("Invalid token!"));
  }

  next();
});

type MessageProfile = {
  id: string;
  name: string;
  avatar?: string;
};

type IncomingMessage = {
  message: {
    id: string;
    time: string;
    text: string;
    user: MessageProfile;
  };
  to: string;
  conversationId: string;
};

type OutgoingMessageResponse = {
  message: {
    id: string;
    time: string;
    text: string;
    user: MessageProfile;
    viewed: boolean;
  };
  from: MessageProfile;
  conversationId: string;
};

type SeenData = {
  messageId: string;
  peerId: string;
  conversationId: string;
};

io.on("connection", (socket) => {
  console.log(socket.data)
  let socketData = socket.data as { jwtDecode: { id: string } };
  let userId = socketData.jwtDecode.id;

  socket.join(userId);

  console.log("user is connected");
  socket.on("chat:new", async (data: IncomingMessage) => {
    let { conversationId, to, message } = data;

    await ConversationModel.findByIdAndUpdate(conversationId, {
      $push: {
        chats: {
          sentBy: message.user.id,
          content: message.text,
          timestamp: message.time,
        },
      },
    });

    let messageResponse: OutgoingMessageResponse = {
      from: message.user,
      conversationId,
      message: { ...message, viewed: false },
    };

    socket.to(to).emit("chat:message", messageResponse);
  });

  socket.on(
    "chat:seen",
    async ({ conversationId, messageId, peerId }: SeenData) => {
      await markChatAsViewed(peerId, conversationId);
      socket.to(peerId).emit("chat:seen", { conversationId, messageId });
    }
  );

  socket.on("chat:typing", (typingData: { to: string; active: boolean }) => {
    socket.to(typingData.to).emit("chat:typing", { typing: typingData.active });
  });
});

app.use(function (err, req, res, next) {
  res.status(500).json({ message: err.message });
} as express.ErrorRequestHandler);

server.listen(process.env.PORT, () => {
  console.log(`Server running at http://${ipAddress}:${process.env.PORT}`);
  }
);