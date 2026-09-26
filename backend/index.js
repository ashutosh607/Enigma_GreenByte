require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

// Route imports
const authRoutes = require("./routes/authRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const discoveryRoutes = require("./routes/discoveryRoutes");
const dealRoutes = require("./routes/dealRoutes");
const priceRequestRoutes = require("./routes/priceRequestRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const exchangeRoutes = require("./routes/exchangeRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const impactRoutes = require("./routes/impactRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Connect to Database
connectDB();

// API Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/discovery", discoveryRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/price-requests", priceRequestRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/exchanges", exchangeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/impact", impactRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    application: "RE:SOURCE — Industrial Resource Exchange",
    negotiationEngine: "Structured Price Slider (No WebSocket/Chat)",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "An unexpected server error occurred",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 RE:SOURCE API server running on port ${PORT}`);
});
