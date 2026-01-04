# 🏆 Samartha Setu – AI-Driven Sustainable Food Redistribution & Disaster Relief Platform

> **Winning Solution for ₹85 Lakhs Hackathon**

## 🎯 Core Mission
Connect surplus edible food from donors to nearby receivers instantly using AI and real-time hyperlocal mapping, ensuring zero waste through automated fallback and gamified sustainability incentives.

## ✨ Key Features

- **Real-Time Surplus Listings** - Live WebSocket broadcasts
- **AI-Powered Matching** - Geospatial queries with intelligent fallback routing
- **Live Map Interface** - Leaflet-based real-time visualization
- **Real-Time Chat** - Socket.IO powered communication
- **Dual Mode System** - Normal & Disaster Relief modes
- **Sustainability Dashboard** - CO₂ impact tracking with Recharts
- **Gamified Community** - Points, badges, leaderboards
- **AI Bots** - Nutrition analysis & General assistance (Gemini AI)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Google Gemini API key

### Installation

```bash
npm run install-all
```

### Environment Setup

**Backend** (`backend/.env`):
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key
```

**Frontend** (`frontend/.env`):
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Run Development

```bash
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## 🏗️ Tech Stack

**Frontend:**
- React + React Router
- Leaflet (Maps)
- Recharts (Analytics)
- Socket.IO Client
- Framer Motion
- Lucide React Icons

**Backend:**
- Node.js + Express
- MongoDB Atlas
- Socket.IO
- JWT + bcrypt
- Cloudinary
- Google Gemini AI

## 📁 Project Structure

```
samartha-setu/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── utils/
│   └── public/
└── README.md
```

## 🎨 UI Theme
Indian flag colors (Saffron, White, Green) with Ashoka Chakra blue accents - patriotic yet premium.

## 🏅 Winning Criteria
- Innovation ✓
- Community Impact ✓
- Real-time AI Routing ✓
- Zero Food Waste Fallback ✓
- Gamified Sustainability ✓
- Best UI/UX ✓
- High Accountability ✓

---

**Built to Win ₹85 Lakhs** 🚀

