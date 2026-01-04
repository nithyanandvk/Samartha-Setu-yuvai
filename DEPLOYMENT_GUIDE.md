# 🚀 Deployment Guide: Samartha Setu

Complete step-by-step guide to deploy your application on **Netlify (Frontend)** and **Render (Backend)**

---

## 📋 Prerequisites

1. **GitHub Account** - Your code should be on GitHub
2. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
3. **Render Account** - Sign up at [render.com](https://render.com)
4. **MongoDB Atlas Account** - Sign up at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
5. **Cloudinary Account** - Sign up at [cloudinary.com](https://cloudinary.com)

---

## 🗄️ Step 1: Setup MongoDB Atlas (Database)

### 1.1 Create MongoDB Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Create"** or **"Build a Database"**
3. Choose **FREE (M0)** tier
4. Select your preferred **Cloud Provider & Region** (choose closest to your users)
5. Click **"Create Cluster"**

### 1.2 Configure Database Access
1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Create username and password (SAVE THESE!)
5. Set privileges to **"Atlas admin"** or **"Read and write to any database"**
6. Click **"Add User"**

### 1.3 Configure Network Access
1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for Render deployment)
   - Or add specific IPs: `0.0.0.0/0`
4. Click **"Confirm"**

### 1.4 Get Connection String
1. Go to **"Database"** → Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
4. Replace `<password>` with your actual password
5. Add database name at the end: `...mongodb.net/samartha-setu?retryWrites=true&w=majority`
6. **SAVE THIS STRING** - You'll need it for Render

---

## 🔧 Step 2: Prepare Backend for Render

### 2.1 Create Environment Variables File
Create a `.env.example` file in the `backend` folder:

```env
# MongoDB
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend URL (will be your Netlify URL)
FRONTEND_URL=https://your-app-name.netlify.app

# Port (Render will set this automatically)
PORT=10000

# Google AI (if using)
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### 2.2 Update server.js for Production
The server.js should already handle environment variables. Make sure it uses:
- `process.env.PORT` for the port
- `process.env.MONGODB_URI` for database
- `process.env.FRONTEND_URL` for CORS

### 2.3 Create render.yaml (Optional but Recommended)
Create `render.yaml` in the root directory:

```yaml
services:
  - type: web
    name: samartha-setu-backend
    env: node
    plan: free
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
      - key: FRONTEND_URL
        sync: false
      - key: GOOGLE_AI_API_KEY
        sync: false
```

---

## 🌐 Step 3: Deploy Backend to Render

### 3.1 Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your repository: `yuvai` (or your repo name)

### 3.2 Configure Service Settings
- **Name**: `samartha-setu-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or `master`)
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: **Free** (or paid if needed)

### 3.3 Add Environment Variables
Click **"Add Environment Variable"** and add:

```
NODE_ENV = production
MONGODB_URI = (your MongoDB Atlas connection string)
JWT_SECRET = (generate a long random string)
CLOUDINARY_CLOUD_NAME = (from Cloudinary dashboard)
CLOUDINARY_API_KEY = (from Cloudinary dashboard)
CLOUDINARY_API_SECRET = (from Cloudinary dashboard)
FRONTEND_URL = https://your-app-name.netlify.app (update after Netlify deployment)
GOOGLE_AI_API_KEY = (if using)
```

### 3.4 Deploy
1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Wait for deployment to complete (5-10 minutes)
4. **Copy your Render URL** (e.g., `https://samartha-setu-backend.onrender.com`)

### 3.5 Important Notes for Render
- **Free tier**: Service spins down after 15 minutes of inactivity
- First request after spin-down takes ~30-60 seconds
- Consider upgrading to paid plan for always-on service
- Render provides automatic HTTPS

---

## 🎨 Step 4: Prepare Frontend for Netlify

### 4.1 Update API URL
Check your frontend code for API calls. Update environment variables:

Create `.env.production` in `frontend` folder:

```env
REACT_APP_API_URL=https://your-render-backend-url.onrender.com
```

### 4.2 Update API Configuration
Check `frontend/src/utils/api.js` or wherever you make API calls. Make sure it uses:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

### 4.3 Create netlify.toml
Create `netlify.toml` in the `frontend` folder:

```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### 4.4 Create _redirects file (Alternative)
Create `frontend/public/_redirects`:

```
/*    /index.html   200
```

---

## 🚀 Step 5: Deploy Frontend to Netlify

### 5.1 Build Locally (Test First)
```bash
cd frontend
npm run build
```

Test the build folder to ensure everything works.

### 5.2 Deploy via Netlify Dashboard
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to **GitHub**
4. Select your repository: `yuvai` (or your repo name)
5. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`

### 5.3 Add Environment Variables
1. Go to **Site settings** → **Environment variables**
2. Add:
   ```
   REACT_APP_API_URL = https://your-render-backend-url.onrender.com
   REACT_APP_SOCKET_URL = https://your-render-backend-url.onrender.com
   NODE_VERSION = 18
   ```
   
   **Note**: `REACT_APP_SOCKET_URL` is optional - if not set, it will use `REACT_APP_API_URL`. But it's good to set both for clarity.

### 5.4 Deploy
1. Click **"Deploy site"**
2. Wait for build to complete (3-5 minutes)
3. Your site will be live at: `https://random-name-12345.netlify.app`

### 5.5 Update Site Name (Optional)
1. Go to **Site settings** → **Change site name**
2. Change to something like: `samartha-setu` or `yuvai-setu`
3. Your new URL: `https://samartha-setu.netlify.app`

---

## 🔄 Step 6: Update Backend with Frontend URL

### 6.1 Update Render Environment Variables
1. Go back to Render dashboard
2. Open your backend service
3. Go to **Environment** tab
4. Update `FRONTEND_URL` to your Netlify URL:
   ```
   FRONTEND_URL = https://your-netlify-site.netlify.app
   ```
5. Click **"Save Changes"**
6. Render will automatically redeploy

---

## ✅ Step 7: Final Configuration

### 7.1 Test Your Deployment
1. Visit your Netlify URL
2. Try registering a new user
3. Test all major features
4. Check browser console for errors

### 7.2 Update CORS in Backend
Make sure your Render backend allows your Netlify domain:
- Check `backend/server.js` - CORS should use `process.env.FRONTEND_URL`

### 7.3 MongoDB Atlas Whitelist
1. Go to MongoDB Atlas → Network Access
2. Make sure Render's IPs are allowed (or use `0.0.0.0/0` for all)

---

## 🔐 Step 8: Security Checklist

- [ ] JWT_SECRET is a long, random string (32+ characters)
- [ ] MongoDB password is strong
- [ ] Cloudinary credentials are secure
- [ ] Environment variables are set in both platforms
- [ ] CORS is configured correctly
- [ ] HTTPS is enabled (automatic on both platforms)

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend not connecting to MongoDB
- **Solution**: Check MongoDB Atlas network access allows all IPs (`0.0.0.0/0`)
- Check connection string has correct password

**Problem**: CORS errors
- **Solution**: Update `FRONTEND_URL` in Render environment variables
- Check `backend/server.js` CORS configuration

**Problem**: Service keeps spinning down (Free tier)
- **Solution**: This is normal for free tier. First request will be slow.
- Consider upgrading to paid plan for always-on service

### Frontend Issues

**Problem**: API calls failing
- **Solution**: Check `REACT_APP_API_URL` in Netlify environment variables
- Verify backend URL is correct and accessible

**Problem**: Build fails
- **Solution**: Check build logs in Netlify
- Ensure all dependencies are in `package.json`
- Check for TypeScript/ESLint errors

**Problem**: Routes not working (404 errors)
- **Solution**: Ensure `_redirects` file exists in `public` folder
- Or configure redirects in `netlify.toml`

---

## 📝 Quick Reference

### Backend URL (Render)
```
https://your-backend-name.onrender.com
```

### Frontend URL (Netlify)
```
https://your-site-name.netlify.app
```

### MongoDB Atlas
```
https://cloud.mongodb.com
```

### Environment Variables Needed

**Render (Backend)**:
- `MONGODB_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `FRONTEND_URL`
- `GOOGLE_AI_API_KEY` (if using)

**Netlify (Frontend)**:
- `REACT_APP_API_URL`

---

## 🎉 Success!

Your application should now be live! 

- **Frontend**: `https://your-site.netlify.app`
- **Backend**: `https://your-backend.onrender.com`

Remember to:
1. Test all features thoroughly
2. Monitor both platforms for errors
3. Set up custom domain (optional)
4. Enable analytics (optional)

---

## 📞 Need Help?

- **Netlify Docs**: https://docs.netlify.com
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com

Good luck with your deployment! 🚀

