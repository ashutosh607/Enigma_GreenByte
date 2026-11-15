const mongoose = require("mongoose");

let pendingConnection;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing");

  if (!pendingConnection) {
    pendingConnection = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    }).finally(() => {
      pendingConnection = undefined;
    });
  }
  return pendingConnection;
}

module.exports = connectDB;
