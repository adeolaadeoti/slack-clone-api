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
import User from "../src/models/user";
import Channels from "../src/models/channel";
import Conversations from "../src/models/conversations";
import conversations from "./routes/conversations";
import { Server } from "socket.io";
import http from "http";

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
  // console.log("A user connected");
  socket.on("user-join", async (id) => {
    socket.join(id);
    await User.findByIdAndUpdate(id, { isOnline: true });
    io.emit("user-join", { id, isOnline: true });

    socket.on("disconnect", async () => {
      socket.leave(id);
      await User.findByIdAndUpdate(id, { isOnline: false });
      io.emit("user-join", { id, isOnline: false });
    });
  });

  socket.on("update-conversation", async (newConvo) => {
    const user = await User.findById(newConvo.createdBy);
    const conversationIdToUpdate = newConvo._id;

    const conversationToUpdate = await Conversations.findOne({
      _id: conversationIdToUpdate,
      createdBy: user._id,
    }).populate("collaborators");

    if (conversationToUpdate) {
      // Find the collaborator with matching _id
      const collaboratorToUpdate: any = conversationToUpdate.collaborators.find(
        (collaborator: any) =>
          collaborator?._id.toString() === user._id.toString()
      );

      if (collaboratorToUpdate) {
        // Update the conversation's isOnline field based on collaborator's isOnline status
        conversationToUpdate.isOnline = collaboratorToUpdate.isOnline;

        // Save the updated conversation
        await conversationToUpdate.save();

        console.log("Conversation updated:", conversationToUpdate);
      } else {
        console.log("Collaborator not found in conversation");
      }
    } else {
      console.log("Conversation not found");
    }
  });

  // socket.on("update-conversation", async (newConvo) => {
  //   const user = await User.findById(newConvo.createdBy);
  //   await Conversations.findOneAndUpdate(
  //     { _id: newConvo._id, createdBy: user._id },
  //     { isOnline: user.isOnline },
  //     {
  //       new: true,
  //     }
  //   );

  //   socket.on("disconnect", async () => {
  //     // await Conversations.findOneAndUpdate(
  //     //   { _id: newConvo._id, createdBy: user._id },
  //     //   { isOnline: false },
  //     //   {
  //     //     new: true,
  //     //   }
  //     // );
  //   });
  // });

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
          io.to(channelId).emit("message", { message, organisation });
          socket.broadcast.emit("notification", {
            channelName,
            channelId,
            collaborators,
            message,
            organisation,
          });
          await Channels.findByIdAndUpdate(channelId, {
            hasUnreadMessages: true,
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
          io.to(conversationId).emit("message", {
            collaborators,
            organisation,
            message,
          });
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
          await Conversations.findByIdAndUpdate(conversationId, {
            hasUnreadMessages: true,
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  );

  socket.on("disconnect", () => {
    // console.log("A user disconnected");
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
