const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const authMiddleware = (req, res, next) => {
  let token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({
      message: "Access denied. No token provided.",
      code: "AUTH_NO_TOKEN",
    });
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7).trim();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({
        message: "Invalid token payload.",
        code: "AUTH_INVALID_PAYLOAD",
      });
    }

    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json({
      message: "Invalid or expired token.",
      code: "AUTH_INVALID_TOKEN",
      error: error.message,
    });
  }
};

module.exports = authMiddleware;
