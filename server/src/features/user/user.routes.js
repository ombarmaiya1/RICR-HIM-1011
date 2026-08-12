import express from "express";
import { getMe } from "./user.controller.js";
import {IsAuthenticated} from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", IsAuthenticated, getMe);

export default router;
