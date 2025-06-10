require("dotenv").config();
const express = require("express");
const https = require("https"); // Import HTTPS
const fs = require("fs"); // Import File System
const app = express();

const cors = require("cors");
const connectDB = require("./utils/db");

const router = require("./router/authRouter");
const tempRouter = require("./router/templateRouter");
const frameBuilderRouter = require("./router/frameBuilderRouter");
const wpAdminProxy = require("./controllers/iFrameController");

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// CORS Configuration
let corsOptions;

  const allowedOrigins = [
    process.env.FRONTEND_PRODUCTION_URL || "https://g99buildbot.vercel.app",
  ].filter(Boolean);
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


// Middlewares
app.use(cors(corsOptions));

// 2. Global Diagnostic Logger (BEFORE ALL ROUTES)
app.use((req, res, next) => {
  console.log(
    `[Request Logger] Time: ${new Date().toISOString()} - Path: ${
      req.originalUrl
    }`
  );
  next();
});

// 3. Define Body-Parser Middleware
const bodyParserMiddleware = [
  express.json({ limit: "30mb" }),
  express.urlencoded({ extended: true, limit: "30mb" }),
];

// 4. Internal API Routes with Body-Parser
app.use("/api/v1/auth", bodyParserMiddleware, router);
app.use("/api/v1/template", bodyParserMiddleware, tempRouter);
app.use("/api/v1/frame-builder", bodyParserMiddleware, frameBuilderRouter);


// 6. Health Check Endpoint
app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", timestamp: new Date(), environment: NODE_ENV });
});

// 7. Error Handling Middleware (Last)
app.use((err, req, res, next) => {
  console.error("Error caught by middleware:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// 8. HTTPS Server Start Logic
let server;

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 10000; // Use Render's PORT or fallback to 10000
    server = https.createServer(app).listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server is running securely on https://0.0.0.0:${PORT}`);
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
