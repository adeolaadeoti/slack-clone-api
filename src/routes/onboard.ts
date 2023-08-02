import express from "express";
import onboard from "../controllers/onboard";
import { protect } from "../middleware/protect";

const router = express.Router();

router.post("/", protect, onboard);

export default router;
