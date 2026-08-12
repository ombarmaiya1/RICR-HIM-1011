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
import authRoutes from "./src/auth/auth.routes.js";

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
