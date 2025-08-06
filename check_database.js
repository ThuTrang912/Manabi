// Database query script to check card set names
import mongoose from "mongoose";
import CardSet from "./backend/src/models/CardSet.js";

async function checkCardSets() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/manabi");
    console.log("Connected to MongoDB");

    // Find recent card sets
    const cardSets = await CardSet.find()
      .sort({ "metadata.createdAt": -1 })
      .limit(10)
      .select("name source sourceMetadata metadata.createdAt");

    console.log("Recent card sets:");
    cardSets.forEach((set, index) => {
      console.log(`${index + 1}. Name: "${set.name}"`);
      console.log(`   Source: ${set.source}`);
      console.log(`   Created: ${set.metadata?.createdAt}`);
      console.log(`   Source Metadata:`, set.sourceMetadata);
      console.log("---");
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

checkCardSets();
