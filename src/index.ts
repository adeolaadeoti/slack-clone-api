import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import auth from "./routes/auth";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import xss from "xss-clean";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import cors from "cors";
import channel from "./routes/channel";
import message from "./routes/message";
import teammates from "./routes/teammates";
import organisation from "./routes/organisation";
import errorResponse from "./middleware/errorResponse";
import Message from "../src/models/message";
// import User from "../src/models/user";
import Channels from "../src/models/channel";
import Conversations from "../src/models/conversations";
import conversations from "./routes/conversations";
import { Server } from "socket.io";
import http from "http";
import updateUserStatus from "./helpers/updateUserStatus";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

// Connect to MongoDB
connectDB();

// Express configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookie-parser configuration
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 1000,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Set up WebSocket connections
io.on("connection", (socket) => {
  socket.on("user-join", async ({ id, isOnline }) => {
    socket.join(id);
    await updateUserStatus(id, isOnline);
    io.emit("user-join", { id, isOnline });
  });

  socket.on("user-leave", async ({ id, isOnline }) => {
    socket.leave(id);
    await updateUserStatus(id, isOnline);
    io.emit("user-leave", { id, isOnline });
  });

  socket.on("channel-open", async ({ id, userId }) => {
    if (id) {
      socket.join(id);
      const updatedChannel = await Channels.findByIdAndUpdate(
        id,
        { $pull: { hasNotOpen: userId } },
        { new: true }
      );
      io.to(id).emit("channel-updated", updatedChannel);
    }
  });
  socket.on("convo-open", async ({ id, userId }) => {
    if (id) {
      socket.join(id);
      const updatedConversation = await Conversations.findByIdAndUpdate(
        id,
        { $pull: { hasNotOpen: userId } },
        { new: true }
      );
      io.to(id).emit("convo-updated", updatedConversation);
    }
  });

  socket.on(
    "message",
    async ({
      channelId,
      channelName,
      conversationId,
      collaborators,
      isSelf,
      message,
      organisation,
      hasNotOpen,
    }) => {
      try {
        if (channelId) {
          socket.join(channelId);
          await Message.create({
            organisation,
            sender: message.sender,
            content: message.content,
            channel: channelId,
            hasRead: false,
          });
          const updatedChannel = await Channels.findByIdAndUpdate(
            channelId,
            { hasNotOpen },
            { new: true }
          );
          io.to(channelId).emit("message", { message, organisation });
          io.to(channelId).emit("channel-updated", updatedChannel);
          socket.broadcast.emit("notification", {
            channelName,
            channelId,
            collaborators,
            message,
            organisation,
          });
        } else if (conversationId) {
          socket.join(conversationId);
          await Message.create({
            organisation,
            sender: message.sender,
            content: message.content,
            conversation: conversationId,
            collaborators,
            isSelf,
            hasRead: false,
          });
          const updatedConversation = await Conversations.findByIdAndUpdate(
            conversationId,
            { hasNotOpen },
            { new: true }
          );
          io.to(conversationId).emit("message", {
            collaborators,
            organisation,
            message,
          });
          io.to(conversationId).emit("convo-updated", updatedConversation);
          socket.broadcast.emit("notification", {
            collaborators,
            organisation,
            message,
            conversationId,
          });
          socket.broadcast.emit("notification-layout", {
            collaborators,
            conversationId,
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  );

  socket.on("message-view", async (messageId) => {
    await Message.findByIdAndUpdate(messageId, {
      hasRead: true,
    });
    if (message) {
      console.log(message);
      io.emit("message-view", messageId);
    } else {
      console.log("message not found");
    }
  });
});

// Routes
app.use("/api/v1/auth", auth);
app.use("/api/v1/channel", channel);
app.use("/api/v1/messages", message);
app.use("/api/v1/teammates", teammates);
app.use("/api/v1/organisation", organisation);
app.use("/api/v1/conversations", conversations);

// error handler
app.use(errorResponse);

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
