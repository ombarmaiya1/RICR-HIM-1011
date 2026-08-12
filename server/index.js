// CONFIGURATION IMPORTS
import express from "express";
import { PORT } from "./src/config/config.js";
import connectDB from "./src/config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";

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

//********************************************************************************* */

// SERVER CONFIGURATION

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

await connectDB();

// ROUTES
app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/dashboard", dashboardRoutes);

// DEFAULT ERROR HANDLER
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(err.stack);
  res.status(statusCode).json({ message });
});

app.get("/", (req, res) => {
  res.json("Hello World ");
});

app.listen(PORT, () => {
  console.log(`\nServer Started a Port : ${PORT}`);
});
