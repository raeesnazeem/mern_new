require("dotenv").config();
const express = require("express");
const https = require("https"); // Import HTTPS
const fs = require("fs");      // Import File System
const app = express();

const cors = require("cors");
const connectDB = require("./utils/db");

const router = require("./router/authRouter");
const tempRouter = require("./router/templateRouter");
const frameBuilderRouter = require("./router/frameBuilderRouter");
const wpAdminProxy = require("./controllers/iFrameController");

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// CORS Configuration (No changes needed here)
let corsOptions;
if (NODE_ENV === "production") {
  const allowedOrigins = [process.env.FRONTEND_PRODUCTION_URL || "https://g99buildbot.vercel.app"].filter(Boolean);
  corsOptions = {
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
} else {
  corsOptions = {
    origin: [process.env.FRONTEND_DEVELOPMENT_URL || "https://localhost:5173", "https://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  };
}

// Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

// Routes
app.use("/api/v1/auth", router);
app.use("/api/v1/template", tempRouter);
app.use("/api/v1/frame-builder", frameBuilderRouter); 


// =======================================================
// DIAGNOSTIC LOGGER: Add this block
// =======================================================
app.use((req, res, next) => {
  console.log(`[Request Logger] Time: ${new Date().toISOString()} - Path: ${req.originalUrl}`);
  next(); // Pass the request to the next middleware
});
// =======================================================

// Register routes with proper proxying
app.use("/wp-admin", wpAdminProxy);
app.use("/wp-login.php", wpAdminProxy);
app.use("/wp-content", wpAdminProxy);
app.use("/wp-includes", wpAdminProxy);
app.use("/wp-json", wpAdminProxy);
app.use("/resources", wpAdminProxy);

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date(), environment: NODE_ENV });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error caught by middleware:", err.stack);
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "Not allowed by CORS" });
  }
  res.status(500).json({ error: "Internal Server Error" });
});


// =================================================================
// FINAL HTTPS SERVER START LOGIC
// =================================================================
let server;

// Define SSL options - This assumes the .pem files are in the same folder
const sslOptions = {
  key: fs.readFileSync("./localhost+2-key.pem"),
  cert: fs.readFileSync("./localhost+2.pem"),
};

connectDB()
  .then(() => {
    // Create the HTTPS server
    server = https.createServer(sslOptions, app).listen(PORT, () => {
      console.log(`✅ Server is running securely on https://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });

// Process handlers (no changes needed)
process.on("unhandledRejection", (err, promise) => {
  console.error("Unhandled Rejection:", err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});