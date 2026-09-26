const mongoose = require("mongoose");
const dns = require("dns");

// Fix for Windows querySrv ECONNREFUSED error with MongoDB Atlas SRV records
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  // Ignore if custom DNS cannot be set
}

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    if (process.env.MONGO_URI.includes("<db_username>")) {
      console.warn(
        "\n⚠️  [MongoDB Config] Your MONGO_URI in .env still contains '<db_username>'. Please replace it with your MongoDB database username.\n"
      );
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (error.message.includes("bad auth") || error.message.includes("Authentication failed")) {
      console.error(
        "👉 Fix: Update the username and password in your backend/.env MONGO_URI to match your MongoDB Atlas Database User."
      );
    }
  }
};

module.exports = connectDB;
