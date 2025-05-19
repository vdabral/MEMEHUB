const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables.");
}
const JWT_EXPIRATION = "1h"; // Token expiration time

// Function to generate a JWT token

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

module.exports = { generateToken };

// Function to verify a JWT token
const verifyToken = async (token) => {
  try {
    const decoded = await promisify(jwt.verify)(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
