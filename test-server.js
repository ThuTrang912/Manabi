console.log("Testing server...");

// Test if we can import the required modules
try {
  const express = require("express");
  console.log("Express OK");
} catch (e) {
  console.log("Express error:", e.message);
}

try {
  const multer = require("multer");
  console.log("Multer OK");
} catch (e) {
  console.log("Multer error:", e.message);
}

console.log("Test complete");
