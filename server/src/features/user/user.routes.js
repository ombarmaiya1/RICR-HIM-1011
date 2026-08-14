import express from "express";
import {
  getMe,
  uploadUserAvatar,
  deleteUserAvatar,
  updateProfile,
  sendPasswordChangeOTP,
  changePasswordWithOTP,
} from "./user.controller.js";
import { IsAuthenticated } from "../../middlewares/auth.middleware.js";
import { uploadAvatar } from "../../middlewares/upload.middleware.js";

const router = express.Router();

// GET /api/users/me -> Get current authenticated user profile
router.get("/me", IsAuthenticated, getMe);

// POST /api/users/avatar -> Upload profile image avatar (Stored in Cloudinary)
router.post("/avatar", IsAuthenticated, uploadAvatar.single("avatar"), uploadUserAvatar);

// DELETE /api/users/avatar -> Remove profile image avatar
router.delete("/avatar", IsAuthenticated, deleteUserAvatar);

// PUT /api/users/profile -> Update username/fullName and/or email (Requires current password)
router.put("/profile", IsAuthenticated, updateProfile);

// POST /api/users/password/send-otp -> Send OTP to registered email for password change
router.post("/password/send-otp", IsAuthenticated, sendPasswordChangeOTP);

// PUT /api/users/password -> Verify OTP and update password
router.put("/password", IsAuthenticated, changePasswordWithOTP);

export default router;
