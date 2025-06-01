require("dotenv").config(); 
const express = require("express");
const app = express();

const cors = require("cors");
const connectDB = require("./utils/db");

const router = require("./router/authRouter");
const tempRouter = require("./router/templateRouter");
const frameBuilderRouter = require("./router/frameBuilderRouter");

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development"; // Default to 'development'

// CORS Configuration
let corsOptions;

console.log(`Running in ${NODE_ENV} mode.`);

if (NODE_ENV === "production") {
  // Production CORS settings
  const allowedOrigins = [
    process.env.FRONTEND_PRODUCTION_URL || "https://g99buildbot.vercel.app", // Vercel frontend URL
  ].filter(Boolean); // .filter(Boolean) removes any undefined/empty strings if env vars aren't set

  corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman in some cases)
      // or if the origin is in our allowed list.
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`CORS: Blocked origin - ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Set to true if frontend sends cookies or Authorization headers that need to be processed
  };
  console.log("Production CORS Origins:", allowedOrigins);
} else {
  // Development CORS settings
  corsOptions = {
    origin: [
      process.env.FRONTEND_DEVELOPMENT_URL || "http://localhost:5173", //  local Vite frontend
      "http://127.0.0.1:5173", // Alt way to access localhost
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  };
  console.log("Development CORS Origins:", corsOptions.origin);
}

// Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: "30mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "30mb" })); // Parse URL-encoded bodies

// Routes
app.use("/api/v1/auth", router);
app.use("/api/v1/template", tempRouter);
app.use("/api/v1/frame-builder", frameBuilderRouter); 

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", timestamp: new Date(), environment: NODE_ENV });
});

// Error Handling Middleware (basic)
app.use((err, req, res, next) => {
  console.error("Error caught by middleware:", err.stack);
  // If the error is a CORS error, it might have already been handled by the cors middleware's callback
  // but if it bubbles up here:
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "Not allowed by CORS" });
  }
  res.status(500).json({ error: "Internal Server Error" });
});

// Database Connection and Server Start
let server; // Declare server variable to be accessible in the unhandledRejection handler

connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      // Assign the server instance
      console.log(`Server is running on http://localhost:${PORT}`);
      // console.log(`API Documentation available at http://localhost:${PORT}/api-docs`); // Uncomment if you have API docs
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", err);
  // Close server gracefully and exit process
  if (server) {
    server.close(() => {
      console.log("Server closed due to unhandled rejection.");
      process.exit(1);
    });
  } else {
    // If server didn't start, just exit
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  // Close server gracefully and exit process
  if (server) {
    server.close(() => {
      console.log("Server closed due to uncaught exception.");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
