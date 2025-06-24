require("dotenv").config();
const express = require("express");
const https = require("https"); // Import HTTPS
const fs = require("fs"); // Import File System
const app = express();

const { InferenceClient } = require('@huggingface/inference'); //huggingface
const hf = new InferenceClient(process.env.HF_TOKEN);

const cors = require("cors");
const connectDB = require("./utils/db");

const router = require("./router/authRouter");
const tempRouter = require("./router/templateRouter");
const frameBuilderRouter = require("./router/frameBuilderRouter");
const AiRouter = require("./router/AiRouter")
const EmailRouter = require("./router/EmailRouter")


const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// CORS Configuration
let corsOptions;
if (NODE_ENV === "production") {
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [
        "https://g99buildbot.vercel.app",
        "https://g99buildbot.raeescodes.xyz",
        "https://app.raeescodes.xyz",
      ];
  corsOptions = {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-WP-Nonce", "Accept"],
    credentials: true,
  };
} else {
  corsOptions = {
    origin: [
      process.env.FRONTEND_DEVELOPMENT_URL || "https://localhost:5173",
      "https://127.0.0.1:5173",
      "https://g99buildbot.raeescodes.xyz",
      "https://raeescodes.xyz"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-WP-Nonce", "Accept"],
    credentials: true,
  };
}

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


app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));


app.use("/api/v1/auth", router);
app.use("/api/v1/template", tempRouter);
app.use("/api/v1/frame-builder", frameBuilderRouter);
app.use("/api/v1/ai-gen", AiRouter)
app.use('/api/v1/email', EmailRouter)

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
const sslOptions = {
  key: fs.readFileSync("./localhost+2-key.pem"),
  cert: fs.readFileSync("./localhost+2.pem"),
};

connectDB()
  .then(() => {
    server = https.createServer(sslOptions, app).listen(PORT, () => {
      console.log(`✅ Server is running securely on https://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });

// Process Handlers
process.on("unhandledRejection", (err) => {
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});
process.on("uncaughtException", (err) => {
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});
