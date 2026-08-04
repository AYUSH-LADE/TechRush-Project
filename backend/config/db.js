const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI?.trim();

  if (!uri || process.env.DISABLE_MONGO === "true") {
    console.log("MongoDB connection skipped. Set MONGO_URI and disable DISABLE_MONGO to enable database access.");
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      family: 4,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (err) {
    console.warn(`MongoDB unavailable: ${err.message}`);
    console.warn("Continuing without MongoDB in demo mode.");
    return false;
  }
};

module.exports = connectDB;
