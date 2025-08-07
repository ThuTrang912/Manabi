import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const testConnection = async () => {
  try {
    console.log("Testing MongoDB connection...");
    console.log("MONGO_URI:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully!");

    // Test if we can create a simple document
    const testSchema = new mongoose.Schema({ name: String });
    const TestModel = mongoose.model("Test", testSchema);

    const testDoc = new TestModel({ name: "connection test" });
    await testDoc.save();
    console.log("✅ Can create documents");

    await TestModel.deleteOne({ name: "connection test" });
    console.log("✅ Can delete documents");

    await mongoose.disconnect();
    console.log("✅ Connection test completed successfully!");
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    process.exit(1);
  }
};

testConnection();
