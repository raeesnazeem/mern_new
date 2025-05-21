require("dotenv").config();
const express = require('express');
const app = express();
// const PORT = process.env.PORT || 3000;  // Use environment variable for port
const PORT = process.env.PORT || 10000;
const router = require('./router/authRouter');
const tempRouter = require('./router/templateRouter');
const cors = require('cors');
const connectDB = require('./utils/db');

// CORS Configuration
// const corsOptions = {
//   origin: [
//     process.env.SERVER_API_URL || 'http://localhost:5173',
//     process.env.ALT_SERVER_API_URL || 'http://127.0.0.1:5173',
//     'https://g99buildbot.vercel.app'
//   ].filter(Boolean),
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
// };
const allowedOrigins = [
  process.env.SERVER_API_URL || 'http://localhost:5173',
  process.env.ALT_SERVER_API_URL || 'http://127.0.0.1:5173',
  'https://g99buildbot.vercel.app'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser requests (e.g., curl, Postman)

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
console.log('Allowed origins:', corsOptions.origin);


// Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: '30mb' })) // parse json bodies
app.use(express.urlencoded({ extended: true, limit: '30mb' })) //parse url encoded 

// Routes
app.use('/api/v1/auth', router);
app.use('/api/v1/template', tempRouter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() })
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' })
})

// Database Connection and Server Start
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`)
  });
}).catch(err => {
  console.error('Database connection failed:', err)
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err)
  // Close server and exit process
  server.close(() => process.exit(1));
});