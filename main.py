from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse, JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
import os
import time
from dotenv import load_dotenv
from urllib.parse import urlparse, urlencode
import json
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from google_auth_oauthlib.flow import Flow

load_dotenv()

app = FastAPI()

# CORS configuration for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store (use Redis or database in production)
sessions = {}

# In-memory user store (use database in production)
# Structure: {email: {name: str, phone: str, created_at: str}}
users = {}

# In-memory listings store with user association
# Structure: {listing_id: {user_email: str, listing_data: dict}}
user_listings = {}

# Google OAuth configuration
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:8000/api/auth/google/callback')

def validate_email(email: str) -> bool:
    """Validate that email is from allowed domain (gmail.com for testing)"""
    # For testing, allow any gmail.com email
    # In production, change this back to @bu.edu
    return email.lower().endswith('@gmail.com')

def init_saml_auth(req):
    """Initialize SAML authentication"""
    auth = OneLogin_Saml2_Auth(req, custom_base_path=os.path.join(os.path.dirname(__file__), 'saml'))
    return auth

def prepare_flask_request(request: Request):
    """Prepare request data for SAML library"""
    url_data = urlparse(request.url._url)
    return {
        'https': 'on' if request.url.scheme == 'https' else 'off',
        'http_host': request.url.hostname,
        'server_port': url_data.port,
        'script_name': request.url.path,
        'get_data': dict(request.query_params),
        'post_data': {}  # Will be populated for POST requests
    }

def validate_bu_email(email: str) -> bool:
    """Validate that email is from bu.edu domain"""
    return email.lower().endswith('@bu.edu')

@app.get("/")
async def root():
    return {"message": "DormConnection Google OAuth Authentication API"}

@app.get("/api/auth/google/login")
async def google_login(request: Request):
    """Initiate Google OAuth login"""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    # Create OAuth flow
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [GOOGLE_REDIRECT_URI]
            }
        },
        scopes=[
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'openid'
        ],
        redirect_uri=GOOGLE_REDIRECT_URI
    )
    
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='select_account'
    )
    
    # Store state in session for validation (in production, use proper session storage)
    sessions[f"oauth_state_{state}"] = {"created_at": time.time()}
    
    return RedirectResponse(url=authorization_url)

@app.get("/api/auth/google/callback")
async def google_callback(request: Request, code: str = None, error: str = None, state: str = None):
    """Handle Google OAuth callback"""
    if error:
        return RedirectResponse(
            url=f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/login?error=auth_cancelled",
            status_code=302
        )
    
    if not code:
        return RedirectResponse(
            url=f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/login?error=no_code",
            status_code=302
        )
    
    try:
        # Create OAuth flow with same scopes as login
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [GOOGLE_REDIRECT_URI]
                }
            },
            scopes=[
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
                'openid'
            ],
            redirect_uri=GOOGLE_REDIRECT_URI,
            state=state
        )
        
        # Exchange code for tokens
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            credentials.id_token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
        
        email = idinfo.get('email')
        
        # Validate email domain (gmail.com for testing)
        if not validate_email(email):
            return RedirectResponse(
                url=f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/login?error=invalid_domain",
                status_code=302
            )
        
        # Create session
        session_id = os.urandom(32).hex()
        sessions[session_id] = {
            'email': email,
            'name': idinfo.get('name', ''),
            'picture': idinfo.get('picture', ''),
            'attributes': idinfo
        }
        
        # Redirect to frontend with session token
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        response = RedirectResponse(
            url=f"{frontend_url}/login?success=true",
            status_code=302
        )
        response.set_cookie(
            key="session_token",
            value=session_id,
            httponly=True,
            secure=os.getenv('ENVIRONMENT') == 'production',
            samesite='lax',
            max_age=3600 * 24  # 24 hours
        )
        return response
        
    except Exception as e:
        print(f"Error during Google OAuth: {str(e)}")
        return RedirectResponse(
            url=f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/login?error=oauth_error",
            status_code=302
        )

@app.get("/api/saml/metadata")
async def saml_metadata(request: Request):
    """Return SAML SP metadata"""
    req = prepare_flask_request(request)
    auth = init_saml_auth(req)
    settings = auth.get_settings()
    metadata = settings.get_sp_metadata()
    errors = settings.validate_metadata(metadata)

    if len(errors) == 0:
        return Response(content=metadata, media_type="text/xml")
    else:
        raise HTTPException(status_code=500, detail=f"Error generating metadata: {', '.join(errors)}")

@app.get("/api/saml/login")
async def saml_login(request: Request):
    """Initiate SAML login"""
    req = prepare_flask_request(request)
    auth = init_saml_auth(req)
    
    # Get the SSO URL and redirect
    sso_url = auth.login()
    return RedirectResponse(url=sso_url)

@app.post("/api/saml/acs")
async def saml_acs(request: Request):
    """Assertion Consumer Service - handle SAML response"""
    req = prepare_flask_request(request)
    
    # Get POST data
    form_data = await request.form()
    req['post_data'] = dict(form_data)
    
    auth = init_saml_auth(req)
    auth.process_response()
    
    errors = auth.get_errors()
    
    if not errors:
        if auth.is_authenticated():
            # Get user attributes
            attributes = auth.get_attributes()
            nameid = auth.get_nameid()
            
            # Extract email (different IdPs use different attribute names)
            email = None
            for attr_name in ['email', 'mail', 'emailAddress', 'urn:oid:0.9.2342.19200300.100.1.3']:
                if attr_name in attributes and attributes[attr_name]:
                    email = attributes[attr_name][0] if isinstance(attributes[attr_name], list) else attributes[attr_name]
                    break
            
            # Fallback to nameid if email not in attributes
            if not email:
                email = nameid
            
            # Validate BU email domain
            if not validate_bu_email(email):
                return RedirectResponse(
                    url=f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/login?error=invalid_domain",
                    status_code=302
                )
            
            # Create session
            session_id = os.urandom(32).hex()
            sessions[session_id] = {
                'email': email,
                'attributes': attributes,
                'nameid': nameid,
                'session_index': auth.get_session_index()
            }
            
            # Redirect to frontend with session token
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
            response = RedirectResponse(
                url=f"{frontend_url}/login?success=true",
                status_code=302
            )
            response.set_cookie(
                key="session_token",
                value=session_id,
                httponly=True,
                secure=os.getenv('ENVIRONMENT') == 'production',
                samesite='lax',
                max_age=3600 * 24  # 24 hours
            )
            return response
        else:
            return RedirectResponse(
                url=f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/login?error=not_authenticated",
                status_code=302
            )
    else:
        error_reason = auth.get_last_error_reason()
        return RedirectResponse(
            url=f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/login?error=saml_error",
            status_code=302
        )

@app.get("/api/saml/slo")
async def saml_slo(request: Request):
    """Single Logout Service"""
    req = prepare_flask_request(request)
    auth = init_saml_auth(req)
    
    url = auth.logout()
    return RedirectResponse(url=url)

@app.get("/api/auth/user")
async def get_user(request: Request):
    """Get current authenticated user"""
    session_token = request.cookies.get('session_token')
    
    if not session_token or session_token not in sessions:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user_data = sessions[session_token]
    email = user_data['email']
    
    # Check if user has completed profile
    user_profile = users.get(email)
    has_profile = user_profile is not None
    
    # Check if user has an active listing
    user_listing_id = None
    for listing_id, listing_info in user_listings.items():
        if listing_info['user_email'] == email:
            user_listing_id = listing_id
            break
    
    return {
        'email': email,
        'attributes': user_data['attributes'],
        'hasProfile': has_profile,
        'profile': user_profile,
        'hasListing': user_listing_id is not None,
        'listingId': user_listing_id
    }

@app.post("/api/auth/logout")
async def logout(request: Request):
    """Logout user"""
    session_token = request.cookies.get('session_token')
    
    if session_token and session_token in sessions:
        del sessions[session_token]
    
    response = JSONResponse(content={"message": "Logged out successfully"})
    response.delete_cookie("session_token")
    return response

@app.get("/api/listings")
async def get_listings():
    """Get all listings (from JSON file + active user listings)"""
    # Load from listings.json or database
    try:
        with open('src/listings.json', 'r') as f:
            data = json.load(f)
        base_listings = data.get('listings', [])
    except FileNotFoundError:
        base_listings = []
    
    # Add active user listings
    for listing_id, listing_info in user_listings.items():
        listing_data = listing_info['listing_data'].copy()
        listing_data['id'] = listing_id
        listing_data['userEmail'] = listing_info['user_email']
        listing_data['isUserListing'] = True
        base_listings.append(listing_data)
    
    return base_listings

@app.post("/api/listings")
async def create_listing(request: Request):
    """Create a new listing (requires authentication, max 1 per user)"""
    session_token = request.cookies.get('session_token')
    
    if not session_token or session_token not in sessions:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    user_data = sessions[session_token]
    email = user_data['email']
    
    # Check if user already has an active listing
    for listing_id, listing_info in user_listings.items():
        if listing_info['user_email'] == email:
            raise HTTPException(
                status_code=400, 
                detail="You already have an active listing. Please delete it before creating a new one."
            )
    
    listing_data = await request.json()
    
    # Generate unique listing ID
    import uuid
    listing_id = f"user_{uuid.uuid4().hex[:8]}"
    
    # Store listing with user association
    from datetime import datetime
    user_listings[listing_id] = {
        'user_email': email,
        'listing_data': listing_data,
        'created_at': datetime.now().isoformat()
    }
    
    return {
        "message": "Listing created successfully", 
        "listingId": listing_id,
        "data": listing_data
    }

@app.get("/api/listings/{listing_id}")
async def get_listing(listing_id: str):
    """Get a specific listing by ID"""
    # Check user listings first
    if listing_id in user_listings:
        listing_info = user_listings[listing_id]
        listing_data = listing_info['listing_data'].copy()
        listing_data['id'] = listing_id
        listing_data['userEmail'] = listing_info['user_email']
        listing_data['isUserListing'] = True
        return listing_data
    
    # Fall back to listings.json
    try:
        with open('src/listings.json', 'r') as f:
            data = json.load(f)
        listings = data.get('listings', [])
        for listing in listings:
            if listing.get('id') == listing_id:
                return listing
    except FileNotFoundError:
        pass
    
    raise HTTPException(status_code=404, detail="Listing not found")

@app.delete("/api/listings/{listing_id}")
async def delete_listing(listing_id: str, request: Request):
    """Delete a listing (only owner can delete)"""
    session_token = request.cookies.get('session_token')
    
    if not session_token or session_token not in sessions:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    user_data = sessions[session_token]
    email = user_data['email']
    
    # Check if listing exists and belongs to user
    if listing_id not in user_listings:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if user_listings[listing_id]['user_email'] != email:
        raise HTTPException(status_code=403, detail="You can only delete your own listings")
    
    # Delete the listing
    del user_listings[listing_id]
    
    return {"message": "Listing deleted successfully"}

@app.post("/api/profile")
async def create_or_update_profile(request: Request):
    """Create or update user profile"""
    session_token = request.cookies.get('session_token')
    
    if not session_token or session_token not in sessions:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    user_data = sessions[session_token]
    email = user_data['email']
    
    profile_data = await request.json()
    
    from datetime import datetime
    # Store or update user profile
    users[email] = {
        'name': profile_data.get('name', ''),
        'phone': profile_data.get('phone', ''),
        'created_at': users.get(email, {}).get('created_at', datetime.now().isoformat())
    }
    
    return {"message": "Profile saved successfully", "profile": users[email]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
