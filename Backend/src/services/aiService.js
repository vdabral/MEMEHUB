const axios = require("axios");
const { GEMINI_AI_API_KEY, DEBUG_AI } = process.env;

// Gemini model configuration
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_AI_API_KEY}`;

// Utility to check for base64 images
const isBase64 = (str) => {
  return (
    typeof str === "string" &&
    (/^data:image\/[a-z]+;base64,/.test(str) ||
      /^[A-Za-z0-9+/]+={0,2}$/.test(str))
  );
};

// Prompts
const getCaptionPrompt = (url) =>
  `Write a funny meme caption for this image: ${url}`;
const getTagPrompt = (text) =>
  `Suggest 5 relevant, short, comma-separated tags for this meme: ${text}`;

// Fallback captions and tags
const fallbackCaptions = [
  "When the AI ghosted you… again!",
  "404: Caption not found.",
  "Me waiting for AI to be funny.",
  "AI said: 'I'm on a break!'",
  "When you try to use AI but the API is down",
];

const fallbackTags = ["funny", "relatable", "meme", "AI", "dev"];

const getRandomFallbackCaption = () =>
  fallbackCaptions[Math.floor(Math.random() * fallbackCaptions.length)];

// Generate meme caption
const generateCaption = async (imageUrl) => {
  if (isBase64(imageUrl)) {
    console.warn("[AIService] Base64 image detected, using mock caption.");
    return "When you try to use AI but the API only wants text!";
  }

  if (DEBUG_AI === "true") {
    console.log("[AIService] DEBUG mode ON — returning mock caption.");
    return getRandomFallbackCaption();
  }

  try {
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: getCaptionPrompt(imageUrl) }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    const caption =
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (caption) return caption;

    throw new Error("No caption returned from Gemini API");
  } catch (error) {
    console.error("Error generating caption:", error.message);
    console.warn("[AIService] Using mock caption fallback.");
    return getRandomFallbackCaption();
  }
};

// Generate tags
const generateTags = async (text) => {
  if (DEBUG_AI === "true") {
    console.log("[AIService] DEBUG mode ON — returning mock tags.");
    return fallbackTags;
  }

  try {
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: getTagPrompt(text) }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    const tagString =
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (tagString) {
      return tagString
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
    }

    throw new Error("No tags returned from Gemini API");
  } catch (error) {
    console.error("Error generating tags:", error.message);
    console.warn("[AIService] Using mock tags fallback.");
    return fallbackTags;
  }
};

module.exports = {
  generateCaption,
  generateTags,
};
