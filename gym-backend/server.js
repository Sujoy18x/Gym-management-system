require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Routes
const authRoutes = require("./routes/authRoutes");
const memberRoutes = require("./routes/memberRoutes");
const offerRoutes = require("./routes/offerRoutes");
const alertRoutes = require("./routes/alertRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

// Connect to MongoDB
connectDB();

const app = express();

// CORS — allow requests from the Vite frontend and Netlify
// CORS — allow requests from local and production URLs
const allowedOrigins = [
  "http://localhost:5173",
  "https://cosmic-tarsier-b2e6d7.netlify.app",
  "https://gym-frontend-mu-three.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ 
  origin: allowedOrigins, 
  credentials: true 
}));

// Body parser
app.use(express.json());

// Health check
app.get("/", (req, res) => res.json({ message: "🏋️ Lift Club API is running!" }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);

// Global Error Handler
app.use(errorHandler);

// Only run the server locally, not when deployed as a serverless function on Vercel
if (process.env.NODE_ENV !== 'production' || require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
