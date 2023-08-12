import express from "express";
import { register, signin, verify } from "../controllers/auth";

const router = express.Router();

router.post("/register", register);
router.post("/signin", signin);
router.post("/verify", verify);

export default router;
