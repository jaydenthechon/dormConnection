# Quick Start - SAML Authentication

## Prerequisites
- Python 3.8+
- Node.js 16+
- BU email (@bu.edu)

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

4. **Configure SAML settings:**
   - See `SAML_SETUP.md` for detailed configuration
   - Contact BU IT to get IdP certificate and register your app

## Running

1. **Start backend (Terminal 1):**
   ```bash
   python main.py
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
   - Sign in with your @bu.edu account

## Features

✅ SAML2 authentication with BU Shibboleth  
✅ @bu.edu email validation only  
✅ Protected routes  
✅ Session management  
✅ Automatic logout

## Important Notes

- **Development:** Uses HTTP for local testing
- **Production:** MUST use HTTPS (SAML requirement)
- **BU Registration:** Required before production use
- See `SAML_SETUP.md` for complete documentation

## Need Help?

- **SAML Setup:** See `SAML_SETUP.md`
- **BU IT Support:** https://www.bu.edu/tech/support/
- **Technical Issues:** Check backend logs in terminal
