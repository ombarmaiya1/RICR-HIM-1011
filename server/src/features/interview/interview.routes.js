import express from "express";
import { startInterview, submitAnswer, completeInterview, getInterviews, getInterview } from "./interview.controller.js";
import { IsAuthenticated } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/start", IsAuthenticated, startInterview);
router.post("/:interviewId/answer", IsAuthenticated, submitAnswer);
router.post(
  "/:interviewId/complete",
  IsAuthenticated,
  completeInterview
);

router.get("/", IsAuthenticated, getInterviews);

router.get("/:interviewId", IsAuthenticated, getInterview);
export default router;
