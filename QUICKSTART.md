# Quick Start - Local Development

## Prerequisites
- Python 3.8+
- Node.js 16+
- Gmail account for Google sign-in

## Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure OAuth environment variables:**
   - Set Google OAuth values in your `.env` file for local auth testing

## Running

1. **Start backend (Terminal 1):**
   ```bash
   npm run api
   ```
   Runs on http://localhost:8000

2. **Start frontend (Terminal 2):**
   ```bash
   npm run dev
   ```
   Runs on http://localhost:5173

3. **Access the app:**
   - Open http://localhost:5173
   - Click "Login"
   - Sign in with your Gmail account

## Optional Mock Server

If you want the legacy JSON mock server for static testing only:

```bash
npm run mock-server
```

This runs on http://localhost:9000 and is not the FastAPI backend used by the app.

## Features

✅ Google OAuth login  
✅ Protected routes  
✅ Session management  
✅ Automatic logout

## Important Notes

- **Development:** Uses HTTP for local testing
- **Production:** Use HTTPS and correct frontend/backend environment variables
- If listings fail locally, ensure nothing except FastAPI is listening on port 8000

## Need Help?

- **SAML Setup:** See `SAML_SETUP.md`
- **BU IT Support:** https://www.bu.edu/tech/support/
- **Technical Issues:** Check backend logs in terminal
