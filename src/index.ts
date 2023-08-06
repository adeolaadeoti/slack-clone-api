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
import teammates from "./routes/teammates";
import organisation from "./routes/organisation";
import errorResponse from "./middleware/errorResponse";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

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
  max: 100,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Routes
app.use("/api/v1/auth", auth);
app.use("/api/v1/channel", channel);
app.use("/api/v1/teammates", teammates);
app.use("/api/v1/organisation", organisation);

// error handler
app.use(errorResponse);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
