import express from "express";
import { createChannel, getChannels } from "../controllers/channel";
import { protect } from "../middleware/protect";

const router = express.Router();

router.post("/", protect, createChannel);
router.get("/:id", protect, getChannels);

export default router;
