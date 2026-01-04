# 🚀 Samartha Setu - Setup Guide

## Prerequisites

- **Node.js** 18+ and npm
- **MongoDB Atlas** account (or local MongoDB)
- **Cloudinary** account (optional, for image uploads)
- **Google Gemini API** key

## Installation Steps

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Backend Setup

Create `backend/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/samartha-setu
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Get API Keys:**
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Cloudinary**: https://cloudinary.com (optional)
- **Gemini API**: https://makersuite.google.com/app/apikey

### 3. Frontend Setup

Create `frontend/.env` file:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Run the Application

**Option 1: Run both together (recommended)**
```bash
# From root directory
npm run dev
```

**Option 2: Run separately**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## First Time Setup

1. **Register an Account**
   - Go to http://localhost:3000/register
   - Choose your role (Donor, Receiver, Volunteer)
   - Fill in location details

2. **Create Your First Listing**
   - Login to dashboard
   - Click "Create Listing"
   - Use AI Nutrition Bot to get food information
   - Submit listing

3. **Explore Features**
   - View real-time map
   - Check leaderboard
   - Use chat system
   - Enable disaster relief mode

## Features Overview

### ✅ Real-Time Features
- WebSocket-based live listings
- Real-time chat
- Instant notifications
- Live map updates

### ✅ AI Features
- **Nutrition Bot**: Get detailed nutrition info for any food
- **General Assistant**: Ask questions about the platform
- **Smart Matching**: AI-powered donor-receiver matching

### ✅ Gamification
- Points system
- Badges and levels
- Leaderboards (City/State/National)
- CO₂ impact tracking

### ✅ Disaster Relief
- Special disaster mode
- Priority routing
- Emergency listings

## Troubleshooting

### MongoDB Connection Issues
- Check your MongoDB Atlas connection string
- Ensure IP whitelist includes your IP
- Verify database user credentials

### Socket.IO Connection Issues
- Check CORS settings in `backend/server.js`
- Verify `FRONTEND_URL` in `.env`
- Check browser console for errors

### Gemini API Issues
- Verify API key is correct
- Check API quota/limits
- Ensure API is enabled in Google Cloud Console

### Image Upload Issues
- Cloudinary is optional - app works without it
- Local storage fallback is available
- Check file size limits (5MB max)

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure proper CORS origins
4. Use MongoDB Atlas production cluster
5. Set up SSL/HTTPS

### Frontend
1. Build: `npm run build`
2. Serve with nginx or similar
3. Update API URLs in `.env`
4. Enable HTTPS

## Support

For issues or questions, check:
- Backend logs: `backend/` directory
- Frontend console: Browser DevTools
- MongoDB logs: Atlas dashboard

---

**Built to Win ₹85 Lakhs** 🏆

