import express from "express";
import { createChannel, getChannel } from "../controllers/channel";
import { protect } from "../middleware/protect";

const router = express.Router();

router.post("/", protect, createChannel);
router.get("/:id", protect, getChannel);

export default router;
