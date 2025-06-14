require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");

const connectDB = require("./utils/db");

const router = require("./router/authRouter");
const tempRouter = require("./router/templateRouter");
const frameBuilderRouter = require("./router/frameBuilderRouter");



const PORT = process.env.PORT || 10000; // Single PORT definition
const NODE_ENV = process.env.NODE_ENV || "development";

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_PRODUCTION_URL || "https://g99buildbot.vercel.app",
].filter(Boolean);
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: "30mb" })); // Add JSON body parser
app.use(express.urlencoded({ extended: true, limit: "30mb" })); // Add URL-encoded body parser

// Global Diagnostic Logger
app.use((req, res, next) => {
  console.log(
    `[Request Logger] Time: ${new Date().toISOString()} - Path: ${req.originalUrl}`
  );
  next();
});

// Internal API Routes
app.use("/api/v1/auth", router);
app.use("/api/v1/template", tempRouter);
app.use("/api/v1/frame-builder", frameBuilderRouter);

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date(), environment: NODE_ENV });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error caught by middleware:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Server Start Logic
let server;

connectDB()
  .then(() => {
    server = http.createServer(app).listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });

// Process Handlers
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});
