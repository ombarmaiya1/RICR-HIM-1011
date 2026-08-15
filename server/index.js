// CONFIGURATION IMPORTS
import express from "express";
import { PORT } from "./src/config/config.js";
import connectDB from "./src/config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";

// SERVICES IMPORTS
//
//

// ROUTES IMPORTS
import authRoutes from "./src/features/auth/auth.routes.js";
import userRoutes from "./src/features/user/user.routes.js";
import resumeRoutes from "./src/features/resume/resume.routes.js";
import jobRoutes from "./src/features/job/job.routes.js";
import analysisRoutes from "./src/features/analysis/analysis.routes.js";
import interviewRoutes from "./src/features/interview/interview.routes.js";
import dashboardRoutes from "./src/features/dashboard/dashboard.routes.js";
import atsRoutes from "./src/features/ats/ats.routes.js";
import jobSuggestionRoutes from "./src/features/jobSuggestion/jobSuggestion.routes.js";


//********************************************************************************* */

// SERVER CONFIGURATION

const app = express();
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

await connectDB();

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ats", atsRoutes);
app.use("/api/job-suggestions", jobSuggestionRoutes);

// SERVE STATIC CLIENT BUILD IN PRODUCTION & SPA FALLBACK
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, "../client/dist");

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Universal SPA fallback middleware for non-API GET routes (Express 5 compatible)
app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api")) return next();

  const indexPath = path.join(clientDistPath, "index.html");
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  next();
});

// DEFAULT ERROR HANDLERS
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: err.message,
    });
  }
  next(err);
});

app.use((err, req, res, _next) => {
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID",
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(err.stack);
  res.status(statusCode).json({ message });
});

app.listen(PORT, () => {
  console.log(`\nServer Started at Port : ${PORT}`);
});
