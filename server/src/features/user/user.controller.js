import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "./user.model.js";
import OTP from "../auth/otp.model.js";
import SendOTPEmail from "../../services/email.service.js";
import AppError from "../../utils/AppError.js";

/**
 * Get current authenticated user profile
 * GET /api/users/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update username (fullName) and/or email.
 * Requires the user's current password for security verification.
 * PUT /api/users/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, username, email, currentPassword } = req.body;

    if (!currentPassword) {
      throw new AppError("Current password is required to update profile", 400);
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid current password", 400);
    }

    // Update email if provided and changed
    if (email && email.toLowerCase().trim() !== user.email) {
      const trimmedEmail = email.toLowerCase().trim();

      // Check if new email is already in use by another user
      const existingUser = await User.findOne({
        email: trimmedEmail,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        throw new AppError("Email is already registered to another account", 400);
      }

      user.email = trimmedEmail;
    }

    // Update name / username if provided
    const newName = fullName || username;
    if (newName && newName.trim()) {
      user.fullName = newName.trim();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send an OTP to the authenticated user's email to authorize a password change.
 * POST /api/users/password/send-otp
 */
const sendPasswordChangeOTP = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Generate 6-digit OTP
    const newOTP = crypto.randomInt(100000, 999999).toString();

    // Store in OTP collection with 10-minute expiry
    await OTP.findOneAndUpdate(
      { email: user.email },
      { otp: newOTP, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      { upsert: true, new: true }
    );

    // Send email with OTP
    await SendOTPEmail(user.email, newOTP);

    res.status(200).json({
      success: true,
      message: "OTP sent to your registered email address",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password using OTP verification.
 * PUT /api/users/password
 */
const changePasswordWithOTP = async (req, res, next) => {
  try {
    const { otp, newPassword } = req.body;

    if (!otp || !newPassword) {
      throw new AppError("OTP and new password are required", 400);
    }

    if (newPassword.length < 6) {
      throw new AppError("Password must be at least 6 characters", 400);
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Verify OTP from database
    const existingOTP = await OTP.findOne({ email: user.email });
    if (!existingOTP) {
      throw new AppError("OTP expired or not found. Please request a new OTP", 400);
    }

    if (existingOTP.otp !== otp.trim()) {
      throw new AppError("Invalid OTP code", 400);
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Delete used OTP
    await existingOTP.deleteOne();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export {
  getMe,
  updateProfile,
  sendPasswordChangeOTP,
  changePasswordWithOTP,
};