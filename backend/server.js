// const express = require("express");
import express from "express";
import itemsRoutes from "./src/routes/itemsRoutes.js";
import foldersRoutes from "./src/routes/foldersRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import googleRoutes from "./src/routes/googleRoutes.js";
import facebookRoutes from "./src/routes/facebookRoutes.js";
import { connectDB } from "./src/config/db.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

connectDB();

app.use(cors());
app.use(express.json());
app.use("/api", authRoutes);
app.use("/api", googleRoutes);
app.use("/api", facebookRoutes);
app.use("/api", itemsRoutes);
app.use("/api/folders", foldersRoutes);

app.listen(PORT, () => {
  console.log("Server started on PORT:", PORT);
});
