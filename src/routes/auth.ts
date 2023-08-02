import express from "express";
import { register, verify } from "../controllers/auth";

const router = express.Router();

router.post("/register", register);
router.post("/verify", verify);

export default router;
