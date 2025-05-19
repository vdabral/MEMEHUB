const rateLimit = require("express-rate-limit");

// Base configuration for rate limiters
const baseLimiterConfig = {
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later",
    });
  },
};

// General API limiter - 100 requests per minute
const apiLimiter = rateLimit({
  ...baseLimiterConfig,
  windowMs: 60 * 1000,
  max: 100,
  message: "Too many requests from this IP",
});

// Stricter auth limiter - 100 attempts per minute (increased for testing)
const authLimiter = rateLimit({
  ...baseLimiterConfig,
  windowMs: 60 * 1000,
  max: 100,
  message: "Too many login attempts, please try again later",
});

// Upload limiter - 10 uploads per hour
const uploadLimiter = rateLimit({
  ...baseLimiterConfig,
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Upload limit reached, please try again later",
});

// Action limiter (votes, comments) - 30 per minute
const actionLimiter = rateLimit({
  ...baseLimiterConfig,
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many actions, please slow down",
});

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  actionLimiter,
  limiter: actionLimiter, // Export actionLimiter as default limiter for routes
};
