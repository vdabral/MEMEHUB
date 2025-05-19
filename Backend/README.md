# MemeHub

MemeHub is a next-gen meme-sharing platform designed to empower users to create, share, and track their memes while engaging with a vibrant community. This README provides an overview of the project, its features, and how to set it up.

## Features

- **Meme Creation Studio**: Users can create custom memes using a built-in studio with options to upload images, add text, and customize styles. An AI Caption Generator suggests captions based on the image or text input.
  
- **Voting, Commenting & Tagging**: Users can interact with memes through an upvote/downvote system, comment on memes, and add tags. AI can also auto-tag memes for better discoverability.

- **Meme Feed & Search**: Explore memes through various feed tabs (New, Top (24h), Top (Week), Top (All Time)) and search by hashtags or captions.

- **Meme Performance Analytics**: Each meme displays performance metrics such as total views, net votes, and engagement trends over time.

- **User Dashboard**: Users can manage their memes, view statistics, and sort their creations by popularity or date.

- **Highlights & Competitive Edge**: Features like "Meme of the Day," a weekly leaderboard, and a badge system encourage user engagement and competition.

- **Optional Features**: Advanced functionalities such as scheduling meme drops, personalized feeds, and a content moderation dashboard for admins.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT for secure user sessions
- **AI Integration**: Gemini AI API for caption suggestions

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/memehub.git
   ```

2. Navigate to the project directory:
   ```
   cd memehub
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Create a `.env` file in the root directory and add your MongoDB connection string and Gemini AI API key:
   ```
   # MongoDB connection URI
MONGODB_URI=your_mongodb_connection_string

# Google Gemini API Key (if you're using AI features)
GEMINI_API_KEY=your_gemini_api_key

# JWT secret for authentication
JWT_SECRET=your_jwt_secret_key

# Server port
PORT=5001

# Cloudinary configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Toggle AI debugging (true or false)
DEBUG_AI=false

   ```

5. Start the server:
   ```
   node server.js
   ```

## Usage

- Access the application in your browser at `http://localhost:5001`.
- Users can register, log in, create memes, and interact with the community.
- Guests can browse memes without needing an account.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

For more information, visit the [GitHub repository](https://github.com/vdabral/MEMEHUB). Enjoy creating and sharing memes!