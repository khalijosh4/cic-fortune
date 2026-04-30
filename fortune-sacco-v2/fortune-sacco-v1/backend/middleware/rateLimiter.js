const rateLimit = require("express-rate-limit");

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs: windowMs || 15 * 60 * 1000,
    max: max || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: message || "Too many requests, please try again later.",
    },
    skip: (req) => process.env.NODE_ENV === "test",
  });
};

module.exports = { createRateLimiter };
