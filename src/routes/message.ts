import express from "express";
import { protect } from "../middleware/protect";
import { getMessages } from "../controllers/message";

const router = express.Router();

router.get("/", protect, getMessages);

export default router;
