# ✅ Deployment Checklist

Use this checklist to ensure everything is configured correctly before and after deployment.

## Pre-Deployment Checklist

### Backend Preparation
- [ ] MongoDB Atlas cluster created and running
- [ ] Database user created with read/write permissions
- [ ] Network access configured (allow all IPs: `0.0.0.0/0`)
- [ ] MongoDB connection string copied
- [ ] Cloudinary account created
- [ ] Cloudinary credentials obtained (Cloud Name, API Key, API Secret)
- [ ] JWT_SECRET generated (long random string, 32+ characters)
- [ ] Google AI API key obtained (if using AI features)
- [ ] `.env.example` file created in backend folder
- [ ] `render.yaml` file created in root directory
- [ ] Backend code pushed to GitHub

### Frontend Preparation
- [ ] `netlify.toml` file created in frontend folder
- [ ] `_redirects` file created in frontend/public folder
- [ ] API calls use `process.env.REACT_APP_API_URL`
- [ ] No hardcoded localhost URLs in frontend code
- [ ] Frontend builds successfully locally (`npm run build`)
- [ ] Frontend code pushed to GitHub

## Deployment Steps

### Step 1: MongoDB Atlas
- [ ] Cluster created
- [ ] Database user created
- [ ] Network access configured
- [ ] Connection string saved

### Step 2: Render (Backend)
- [ ] Render account created
- [ ] GitHub repository connected
- [ ] New Web Service created
- [ ] Root directory set to `backend`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Environment variables added:
  - [ ] `NODE_ENV = production`
  - [ ] `MONGODB_URI = (your connection string)`
  - [ ] `JWT_SECRET = (your secret)`
  - [ ] `CLOUDINARY_CLOUD_NAME = (your cloud name)`
  - [ ] `CLOUDINARY_API_KEY = (your key)`
  - [ ] `CLOUDINARY_API_SECRET = (your secret)`
  - [ ] `FRONTEND_URL = (will update after Netlify)`
  - [ ] `GOOGLE_AI_API_KEY = (if using)`
- [ ] Service deployed successfully
- [ ] Backend URL copied: `https://your-backend.onrender.com`

### Step 3: Netlify (Frontend)
- [ ] Netlify account created
- [ ] GitHub repository connected
- [ ] New site created
- [ ] Base directory set to `frontend`
- [ ] Build command: `npm run build`
- [ ] Publish directory: `frontend/build`
- [ ] Environment variables added:
  - [ ] `REACT_APP_API_URL = https://your-backend.onrender.com`
  - [ ] `NODE_VERSION = 18`
- [ ] Site deployed successfully
- [ ] Frontend URL copied: `https://your-site.netlify.app`
- [ ] Site name updated (optional)

### Step 4: Final Configuration
- [ ] Updated `FRONTEND_URL` in Render with Netlify URL
- [ ] Render service redeployed after environment variable update
- [ ] Tested frontend can connect to backend
- [ ] Tested user registration
- [ ] Tested user login
- [ ] Tested main features

## Post-Deployment Testing

### Functional Tests
- [ ] Home page loads correctly
- [ ] User can register new account
- [ ] User can login
- [ ] User can create listing
- [ ] User can view listings
- [ ] User can claim listing
- [ ] Chat functionality works (if applicable)
- [ ] Map view loads correctly
- [ ] Dashboard displays correctly
- [ ] Profile page works
- [ ] Admin panel accessible (if admin user exists)

### Technical Checks
- [ ] No console errors in browser
- [ ] API calls are successful (check Network tab)
- [ ] Images upload correctly (Cloudinary)
- [ ] Database operations work (MongoDB)
- [ ] Authentication works (JWT tokens)
- [ ] CORS is configured correctly
- [ ] HTTPS is enabled (both platforms)

## Common Issues & Solutions

### Issue: Backend not connecting to MongoDB
- [ ] Check MongoDB connection string format
- [ ] Verify password is correct (no special characters need encoding)
- [ ] Check Network Access allows all IPs
- [ ] Verify database name in connection string

### Issue: CORS errors
- [ ] Check `FRONTEND_URL` in Render matches Netlify URL exactly
- [ ] Verify no trailing slash in URLs
- [ ] Check backend CORS configuration

### Issue: API calls failing
- [ ] Verify `REACT_APP_API_URL` in Netlify environment variables
- [ ] Check backend URL is accessible (visit in browser)
- [ ] Verify backend is not sleeping (free tier issue)

### Issue: Routes return 404
- [ ] Verify `_redirects` file exists in `frontend/public`
- [ ] Check `netlify.toml` redirect configuration
- [ ] Rebuild and redeploy frontend

### Issue: Build fails
- [ ] Check build logs for specific errors
- [ ] Verify all dependencies in `package.json`
- [ ] Check for TypeScript/ESLint errors
- [ ] Ensure Node version is correct (18)

## Environment Variables Summary

### Render (Backend)
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=https://your-site.netlify.app
GOOGLE_AI_API_KEY=your-key (optional)
```

### Netlify (Frontend)
```
REACT_APP_API_URL=https://your-backend.onrender.com
NODE_VERSION=18
```

## URLs to Save

- **Frontend URL**: `https://________________.netlify.app`
- **Backend URL**: `https://________________.onrender.com`
- **MongoDB Atlas**: `https://cloud.mongodb.com`
- **Cloudinary Dashboard**: `https://cloudinary.com/console`

## Notes

- Render free tier: Service spins down after 15 min inactivity
- First request after spin-down takes 30-60 seconds
- Consider upgrading to paid plan for production
- Both platforms provide automatic HTTPS
- Monitor both dashboards for errors

---

**Deployment Date**: _______________
**Deployed By**: _______________

