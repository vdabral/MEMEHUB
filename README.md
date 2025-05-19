# MemeHub

MemeHub is a next-generation meme-sharing platform where users can create, share, and discover memes, engage with a vibrant community, and track their meme's rise to viral fame. Built for meme lovers and creators, MemeHub combines a modern UI, AI-powered features, and robust backend services for a seamless experience.

---

## 🚀 Live Demo
- **Frontend (Netlify):** [https://memehubcore.netlify.app/](https://memehubcore.netlify.app/)
- **Backend (Render):** [https://memehub-erj0.onrender.com](https://memehub-erj0.onrender.com)

---

## 📝 Project Overview
MemeHub allows users to:
- Create memes using uploaded images or popular templates
- Add custom text overlays and AI-generated captions/tags
- Save/bookmark favorite memes
- View, upvote, comment, and share memes
- Explore trending, new, and top memes
- Manage their profile and meme collection

---

## ✨ Key Features & Technologies
- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Image Hosting:** Cloudinary (direct upload from frontend)
- **Authentication:** JWT-based, secure user sessions
- **AI Integration:** Caption and tag suggestions
- **Other:** Framer Motion, Sonner (toasts), Lucide Icons

---

## 📦 Setup Instructions

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB Atlas or local MongoDB instance
- Cloudinary account (for image uploads)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Main
```

### 2. Backend Setup
```bash
cd Backend
npm install
# Create a .env file with your MongoDB URI, JWT secret, and Cloudinary credentials
cp .env.example .env
# Edit .env with your values
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend/memehub
npm install
# Create a .env file for Vite (see .env.example)
cp .env.example .env
# Edit .env with your API base URL if needed
npm run dev
```

### 4. Access the App
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:8080](http://localhost:8080)

---

## 🏗️ Project Structure

```
Main/
│
├── README.md                # Main project overview and instructions
│
├── Backend/
│   ├── package.json
│   ├── README.md
│   ├── server.js
│   ├── uploads/             # (for legacy/local uploads, not used in Cloudinary flow)
│   └── src/
│       ├── app.js
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── scripts/
│       ├── services/
│       ├── utils/
│       └── views/
│
└── frontend/
    └── memehub/
        ├── package.json
        ├── vite.config.ts
        ├── public/
        └── src/
            ├── App.tsx
            ├── main.tsx
            ├── index.css
            ├── assets/
            ├── components/
            ├── contexts/
            ├── hooks/
            ├── lib/
            ├── pages/
            └── services/
```

---

## 🏗️ Department-Specific Focus: Software Development (SD)
- **Deployed Application:** [https://memehubcore.netlify.app/](https://memehubcore.netlify.app/)
- **Backend API:** [https://memehub-erj0.onrender.com](https://memehub-erj0.onrender.com)
- All links are functional and included above.

---

## 📹 Video Presentation
_Add your video presentation link here._

---

## 🤝 Contributing
Pull requests and suggestions are welcome! Please open an issue or submit a PR for improvements.

## 📄 License
This project is licensed under the MIT License.

---
Enjoy creating and sharing memes on MemeHub!
