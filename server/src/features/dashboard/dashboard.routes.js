import express from "express";
import { getDashboard } from "./dashboard.controller.js";
import IsAuthenticated from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", IsAuthenticated, getDashboard);

export default router;