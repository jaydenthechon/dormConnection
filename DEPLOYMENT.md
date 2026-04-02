# DormConnection Deployment Guide

## 🚀 Quick Deploy (5-10 minutes)

### Prerequisites
- GitHub account
- Vercel account (sign up free at vercel.com)
- Render account (sign up free at render.com)
- Google Cloud Console access (for OAuth redirect URI update)

---

## Part 1: Deploy Backend (Render)

### Step 1: Push Latest Code
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin winterbreak
```

### Step 2: Create Render Web Service
1. Go to https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub account and select `dormConnection` repository
4. Configure:
   - **Name**: `dormconnection-api`
   - **Branch**: `winterbreak`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

### Step 3: Add Environment Variables
In Render dashboard, add these environment variables:
- `GOOGLE_CLIENT_ID`: (copy from your .env file)
- `GOOGLE_CLIENT_SECRET`: (copy from your .env file)
- `GOOGLE_REDIRECT_URI`: `https://dormconnection-api.onrender.com/api/auth/google/callback`
  (Replace `dormconnection-api` with your actual Render service name)
- `FRONTEND_URL`: `https://your-project.vercel.app`
- `ENVIRONMENT`: `production`

### Step 4: Deploy
- Click "Create Web Service"
- Wait 3-5 minutes for deployment
- Note your backend URL: `https://your-service-name.onrender.com`

---

## Part 2: Deploy Frontend (Vercel)

### Step 1: Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your `dormConnection` GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 2: Add Environment Variable
In Vercel project settings → Environment Variables:
- `VITE_API_URL`: `https://your-render-service.onrender.com`

### Step 3: Deploy
- Click "Deploy"
- Wait 1-2 minutes
- Note your frontend URL: `https://your-project.vercel.app`

---

## Part 3: Backend CORS/Cookies

The backend now reads CORS and redirect settings from environment variables.
Set `FRONTEND_URL` and `ENVIRONMENT=production` in Render (Step 3 above), then redeploy.

---

## Part 4: Update Google OAuth

### Update Redirect URI
1. Go to https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Add to **Authorized redirect URIs**:
   - `https://your-render-service.onrender.com/api/auth/google/callback`
4. Add to **Authorized JavaScript origins**:
   - `https://your-project.vercel.app`
5. Click "Save"

---

## 🎉 Test Your Deployment

1. Visit `https://your-project.vercel.app`
2. Click "Login with Google"
3. Test creating/viewing listings

---

## 📝 Important Notes

### Free Tier Limitations
- **Render**: 750 hours/month, spins down after 15 min of inactivity (30s cold start)
- **Vercel**: Unlimited static hosting, 100GB bandwidth/month
- **In-memory storage**: Data resets when Render service restarts

### For Better POC (Optional)
Consider adding a free PostgreSQL database:
- **Supabase** (free tier: 500MB database)
- **Render PostgreSQL** (free tier: 90 days, then expires)

This would persist data between restarts.

---

## 🐛 Troubleshooting

### OAuth Errors
- Verify redirect URI exactly matches in Google Console
- Check CORS includes your Vercel URL
- Ensure `FRONTEND_URL` and Google credentials are set in Render environment variables

### API Connection Issues
- Check `VITE_API_URL` in Vercel
- Verify CORS in main.py includes your Vercel domain
- Check Render logs for errors

### Service Sleeping (Render Free Tier)
- First request after 15 min takes ~30 seconds
- This is normal for free tier
- Upgrade to paid plan ($7/mo) for 24/7 uptime

---

## 📧 For Internship Applications

Your live demo URLs:
- **Frontend**: https://your-project.vercel.app
- **Backend API**: https://your-render-service.onrender.com

Note in your resume/portfolio: "Full-stack web application deployed on Vercel (frontend) and Render (backend) with Google OAuth integration"
