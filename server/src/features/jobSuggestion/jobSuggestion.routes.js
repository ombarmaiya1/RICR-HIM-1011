import { Router } from "express";

import {
  suggestJobs,
  getSavedJobSuggestions,
} from "./jobSuggestion.controller.js";

import {
  IsAuthenticated,
} from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/suggest",
  IsAuthenticated,
  suggestJobs
);

router.get(
  "/",
  IsAuthenticated,
  getSavedJobSuggestions
);

export default router;