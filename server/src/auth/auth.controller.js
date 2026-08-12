import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../user/user.model.js";
import sendOTPEmail from "../services/email.service.js";
import OTP from "./otp.model.js";
import { JWT_SECRET } from "../config/config.js";

const RegisterUser = async (req, res, next) => {
  try {
    const { fullName, email,  password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({

      fullName,
      email,
      password: hashedPassword,
    
    });

    await newUser.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while registering user";
    next(error);
  }
};

const LoginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 1000,
    });

    return res
      .status(200)
      .json({ message: `Login successful` });
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while logging in";
    next(error);
  }
};

const LogoutUser = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "Logout successful" });
};

const SendOTP = async (req, res, next) => {
  try {
   const { email } = req.body;
   if (!email) {
     return res.status(400).json({ message: "Email is required" });
   }

   const existingUser = await User.findOne({ email });
   if (!existingUser) {
     return res.status(400).json({ message: "User does not exist" });
   }

    const newOTP = crypto.randomInt(100000, 999999).toString();

    const existingOTP = await OTP.findOneAndUpdate(
      { email },
      { otp: newOTP, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      { upsert: true, new: true }
    );
    
    await sendOTPEmail(email, newOTP);
    return res.status(200).json({ message: "OTP sent successfully" });

  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while setting OTP";
    next(error);
  }
};

const VerifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const existingOTP = await OTP.findOne({ email });
    if (!existingOTP) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (existingOTP.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await existingOTP.deleteOne();


    const otpToken = jwt.sign({ email }, JWT_SECRET, {
      expiresIn: "10m",
    });

    res.cookie("otpToken", otpToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
    });

    return res.status(200).json({ message: "OTP verified successfully" });  
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while verifying OTP";
    next(error);
  }
};
const ResetPassword = async (req, res, next) => {
  try {
   

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const {email} = req.user;

    const existingUser = await User.findOne({ email });
   
    if (!existingUser) {
      return res.status(400).json({ message: "User does not exist"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    existingUser.password = hashedPassword;
    await existingUser.save();

    res.clearCookie("otpToken");

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error occurred while resetting password";
    next(error);
  }
};

export {
  RegisterUser,
  LoginUser,
  LogoutUser,
  SendOTP,
  VerifyOTP,
  ResetPassword,
};
