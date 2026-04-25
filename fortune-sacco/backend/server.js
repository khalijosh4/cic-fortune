require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const http = require("http");

const { initializeDatabase } = require("./db/database");
const errorHandler = require("./middleware/errorHandler");
const requestLogger = require("./middleware/requestLogger");
const { createRateLimiter } = require("./middleware/rateLimiter");

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes = require("./routes/auth");
const policyRoutes = require("./routes/policies");
const claimsRoutes = require("./routes/claims");
const premiumRoutes = require("./routes/premiums");
const memberRoutes = require("./routes/members");
const hospitalRoutes = require("./routes/hospitals");
const branchRoutes = require("./routes/branches");
const auditRoutes = require("./routes/audit");
const dashboardRoutes = require("./routes/dashboard");
const notificationRoutes = require("./routes/notifications");
const userRoutes = require("./routes/users");

const app = express();
const server = http.createServer(app);

// ── Initialize Database ───────────────────────────────────────────────────────
initializeDatabase().catch(err => {
  console.error("Database initialization error:", err);
  process.exit(1);
});

// ── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5174",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));

app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(requestLogger);

// ── Rate Limiting ─────────────────────────────────────────────────────────────
app.use("/api/auth", createRateLimiter(15 * 60 * 1000, 20, "Too many auth attempts"));
app.use("/api", createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 200
));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    app: process.env.APP_NAME,
    version: process.env.APP_VERSION,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/claims", claimsRoutes);
app.use("/api/premiums", premiumRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      "/api/auth", "/api/policies", "/api/claims", "/api/premiums",
      "/api/members", "/api/hospitals", "/api/branches", "/api/audit",
      "/api/dashboard", "/api/notifications", "/api/users",
    ],
  });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("\n╔═══════════════════════════════════════════════════╗");
  console.log("║     Fortune Sacco CIC Insurance — Backend API     ║");
  console.log("╠═══════════════════════════════════════════════════╣");
  console.log(`║  Status  : ✅ Running                              ║`);
  console.log(`║  Port    : ${PORT}                                   ║`);
  console.log(`║  Env     : ${process.env.NODE_ENV}                        ║`);
  console.log(`║  DB      : SQLite (better-sqlite3)                 ║`);
  console.log(`║  Docs    : http://localhost:${PORT}/health            ║`);
  console.log("╚═══════════════════════════════════════════════════╝\n");
});

module.exports = { app, server };
