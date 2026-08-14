import { Router } from "express";
import {
  checkATSCompatibility,
} from "./ats.controller.js";

import { IsAuthenticated } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/check",
  IsAuthenticated,
  checkATSCompatibility
);

export default router;