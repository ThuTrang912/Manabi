// Test server for image upload
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001;

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Create images directory if it doesn't exist
if (!fs.existsSync("uploads/images")) {
  fs.mkdirSync("uploads/images", { recursive: true });
}

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);

// Serve static files from uploads directory
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, filePath, stat) => {
      res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=31536000",
      });
    },
  })
);

// Test endpoint
app.get("/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

// List images endpoint for testing
app.get("/api/images", (req, res) => {
  try {
    const imagesDir = path.join(__dirname, "uploads", "images");
    const files = fs.readdirSync(imagesDir);
    const imageUrls = files.map((file) => `/uploads/images/${file}`);
    res.json({ images: imageUrls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(`Static files served from: ${path.join(__dirname, "uploads")}`);
});
