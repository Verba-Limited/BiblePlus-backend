import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import bibleRoutes from "./modules/bible/bible.routes";


dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bible", bibleRoutes);


// Test route
app.get("/", (req, res) => {
  res.json({ message: "BiblePlus API is running..." });
});

// Error Handler
app.use(errorHandler);

export default app;
