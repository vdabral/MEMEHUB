// Retroactively populate Tag collection for all existing memes
const mongoose = require("mongoose");
const Meme = require("../models/Meme");
const Tag = require("../models/Tag");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/test";

async function main() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const memes = await Meme.find({});
  let tagCount = 0,
    memeCount = 0;
  for (const meme of memes) {
    memeCount++;
    if (Array.isArray(meme.tags)) {
      for (const tagName of meme.tags) {
        if (typeof tagName !== "string" || !tagName.trim()) continue;
        await Tag.findOneAndUpdate(
          { name: tagName.trim() },
          { $addToSet: { memes: meme._id } },
          { upsert: true, new: true }
        );
        tagCount++;
      }
    }
  }
  console.log(
    `Processed ${memeCount} memes, updated/created ${tagCount} tag-meme associations.`
  );
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Error retro-populating tags:", err);
  process.exit(1);
});
