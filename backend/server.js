// const express = require("express");
import express from "express";
import itemsRoutes from "./src/routes/itemsRoutes.js";
import foldersRoutes from "./src/routes/folderRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import googleRoutes from "./src/routes/googleRoutes.js";
import facebookRoutes from "./src/routes/facebookRoutes.js";
import cardRoutes from "./src/routes/cardRoutes.js";
import { connectDB } from "./src/config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

connectDB();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/api", authRoutes);
app.use("/api", googleRoutes);
app.use("/api", facebookRoutes);
app.use("/api", itemsRoutes);
app.use("/api/folders", foldersRoutes);
app.use("/api/cards", cardRoutes);

app.listen(PORT, () => {
  console.log("Server started on PORT:", PORT);
});
