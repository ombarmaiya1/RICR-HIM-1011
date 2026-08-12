import express from "express";
import { startInterview } from "./interview.controller.js";
import { IsAuthenticated } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/start", IsAuthenticated, startInterview);
router.post("/:interviewId/answer", IsAuthenticated, submitAnswer);
router.post(
  "/:interviewId/complete",
  IsAuthenticated,
  completeInterview
);
export default router;
