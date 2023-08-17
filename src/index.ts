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
import conversations from "./routes/conversations";
import errorResponse from "./middleware/errorResponse";
import Message from "../src/models/message";
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
  console.log("A user connected");

  socket.on("message", async ({ channelId, message }) => {
    try {
      await Message.create({
        sender: message.sender,
        content: message.content,
        channel: channelId,
      });
      // io.emit("message", { channelId, message });
      // Broadcast the message to all connected clients
      io.to(channelId).emit("message", { channelId, message });
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
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
