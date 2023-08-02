import express from "express";
import teammates from "../controllers/teammates";
import { protect } from "../middleware/protect";

const router = express.Router();

router.post("/", protect, teammates);

export default router;
