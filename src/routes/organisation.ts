import express from "express";
import { protect } from "../middleware/protect";
import {
  createOrganisation,
  getOrganisation,
} from "../controllers/organisation";

const router = express.Router();

router.get("/:id", protect, getOrganisation);
router.post("/", protect, createOrganisation);

export default router;
