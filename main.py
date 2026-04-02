from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse, JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
import os
import time
from dotenv import load_dotenv
from urllib.parse import urlparse, urlencode
import json
import re
from typing import Any, Dict, List, Optional
from datetime import datetime
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from google_auth_oauthlib.flow import Flow

try:
    from onelogin.saml2.auth import OneLogin_Saml2_Auth
except ImportError:
    OneLogin_Saml2_Auth = None

load_dotenv()

app = FastAPI()

def normalize_url(url: str) -> str:
    return url.rstrip('/')

def get_frontend_url() -> str:
    return normalize_url(os.getenv('FRONTEND_URL', 'http://localhost:5173'))

def get_allowed_origins() -> List[str]:
    configured_origins = ['http://localhost:5173', get_frontend_url()]
    extra_origins = os.getenv('FRONTEND_URLS', '')

    if extra_origins:
        configured_origins.extend(
            [origin.strip() for origin in extra_origins.split(',') if origin.strip()]
        )

    deduped_origins: List[str] = []
    seen = set()
    for origin in configured_origins:
        normalized = normalize_url(origin)
        if normalized and normalized not in seen:
            deduped_origins.append(normalized)
            seen.add(normalized)

    return deduped_origins

def get_cookie_settings(request: Request) -> Dict[str, Any]:
    is_production = os.getenv('ENVIRONMENT', '').lower() == 'production' or os.getenv('RENDER') == 'true'
    secure_cookie = request.url.scheme == 'https' or is_production

    return {
        'secure': secure_cookie,
        'samesite': 'none' if secure_cookie else 'lax',
    }

def load_seed_data() -> Dict[str, Any]:
    seed_file_path = os.path.join(os.path.dirname(__file__), 'src', 'listings.json')
    try:
        with open(seed_file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

# CORS configuration for development and production
# Add your Vercel deployment URL after deploying frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_origin_regex=r"https://.*\.vercel\.app",
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
    """Validate email format for Google-authenticated users"""
    return bool(email and '@' in email and '.' in email.split('@')[-1])

def parse_price_value(raw_value: Any) -> Optional[float]:
    if raw_value is None:
        return None

    if isinstance(raw_value, (int, float)):
        return float(raw_value)

    if not isinstance(raw_value, str):
        return None

    matches = re.findall(r"\d+(?:,\d{3})*(?:\.\d+)?", raw_value)
    if not matches:
        return None

    return float(matches[0].replace(',', ''))

def normalize_listing(listing: Dict[str, Any], default_id: Optional[str] = None, is_user_listing: bool = False, user_email: Optional[str] = None) -> Dict[str, Any]:
    normalized = listing.copy()

    if default_id is not None:
        normalized['id'] = normalized.get('id', default_id)

    normalized.setdefault('building', 'Untitled Listing')
    normalized.setdefault('DormType', normalized.get('dormType', ''))
    normalized.setdefault('DormStyle', normalized.get('dormStyle', ''))
    normalized.setdefault('description', '')
    normalized.setdefault('address', '')
    normalized.setdefault('lookingFor', 'No preference')
    normalized.setdefault('floorNumber', 'N/A')
    normalized.setdefault('contactEmail', '')
    normalized.setdefault('createdAt', normalized.get('created_at', '1970-01-01T00:00:00'))
    normalized.setdefault('aboutRoommate', {'description': ''})
    normalized.setdefault('dormFeatures', {'featuresAsString': ''})

    if not normalized.get('TradeDescription'):
        dorm_type = normalized.get('DormType', '').strip()
        dorm_style = normalized.get('DormStyle', '').strip()
        if dorm_type and dorm_style:
            normalized['TradeDescription'] = f"{dorm_type} in a {dorm_style}"
        elif dorm_type:
            normalized['TradeDescription'] = dorm_type
        else:
            normalized['TradeDescription'] = normalized.get('building', 'Listing')

    price_source = normalized.get('currentCost') or normalized.get('costDifference')
    normalized['priceValue'] = parse_price_value(price_source)

    if is_user_listing:
        normalized['isUserListing'] = True
    if user_email:
        normalized['userEmail'] = user_email

    return normalized

def init_saml_auth(req):
    """Initialize SAML authentication"""
    if OneLogin_Saml2_Auth is None:
        raise HTTPException(status_code=500, detail="SAML support is not installed on the backend")

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
    return validate_email(email)

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
            url=f"{get_frontend_url()}/login?error=auth_cancelled",
            status_code=302
        )
    
    if not code:
        return RedirectResponse(
            url=f"{get_frontend_url()}/login?error=no_code",
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
                url=f"{get_frontend_url()}/login?error=invalid_domain",
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
        frontend_url = get_frontend_url()
        cookie_settings = get_cookie_settings(request)
        response = RedirectResponse(
            url=f"{frontend_url}/login?success=true",
            status_code=302
        )
        response.set_cookie(
            key="session_token",
            value=session_id,
            httponly=True,
            secure=cookie_settings['secure'],
            samesite=cookie_settings['samesite'],
            max_age=3600 * 24  # 24 hours
        )
        return response
        
    except Exception as e:
        print(f"Error during Google OAuth: {str(e)}")
        return RedirectResponse(
            url=f"{get_frontend_url()}/login?error=oauth_error",
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
                    url=f"{get_frontend_url()}/login?error=invalid_domain",
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
            frontend_url = get_frontend_url()
            cookie_settings = get_cookie_settings(request)
            response = RedirectResponse(
                url=f"{frontend_url}/login?success=true",
                status_code=302
            )
            response.set_cookie(
                key="session_token",
                value=session_id,
                httponly=True,
                secure=cookie_settings['secure'],
                samesite=cookie_settings['samesite'],
                max_age=3600 * 24  # 24 hours
            )
            return response
        else:
            return RedirectResponse(
                url=f"{get_frontend_url()}/login?error=not_authenticated",
                status_code=302
            )
    else:
        error_reason = auth.get_last_error_reason()
        return RedirectResponse(
            url=f"{get_frontend_url()}/login?error=saml_error",
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
    cookie_settings = get_cookie_settings(request)
    response.delete_cookie(
        "session_token",
        secure=cookie_settings['secure'],
        samesite=cookie_settings['samesite']
    )
    return response

@app.get("/api/Dorms")
async def get_dorms():
    """Get all dorm records from the seed JSON file"""
    data = load_seed_data()
    return data.get('Dorms', [])

@app.get("/api/Dorms/{dorm_id}")
async def get_dorm(dorm_id: str):
    """Get a specific dorm record by ID"""
    data = load_seed_data()
    dorms = data.get('Dorms', [])

    for dorm in dorms:
        if str(dorm.get('id')) == dorm_id:
            return dorm

    raise HTTPException(status_code=404, detail="Dorm not found")

@app.get("/api/listings")
async def get_listings(
    _limit: Optional[int] = None,
    q: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    dorm_type: Optional[str] = None,
    dorm_style: Optional[str] = None,
    sort: Optional[str] = None,
):
    """Get listings with optional search, filters, and sorting"""
    # Load from listings.json or database
    data = load_seed_data()
    seed_listings = data.get('listings', [])
    merged_listings: List[Dict[str, Any]] = []

    for index, listing in enumerate(seed_listings):
        normalized = normalize_listing(listing, default_id=str(listing.get('id', f"seed_{index}")))
        merged_listings.append(normalized)
    
    # Add active user listings
    for listing_id, listing_info in user_listings.items():
        normalized = normalize_listing(
            listing_info['listing_data'],
            default_id=listing_id,
            is_user_listing=True,
            user_email=listing_info['user_email']
        )
        normalized['createdAt'] = listing_info.get('created_at', normalized.get('createdAt'))
        merged_listings.append(normalized)

    filtered_listings = merged_listings

    if q:
        query = q.strip().lower()
        filtered_listings = [
            listing for listing in filtered_listings
            if query in " ".join([
                str(listing.get('building', '')),
                str(listing.get('TradeDescription', '')),
                str(listing.get('DormType', '')),
                str(listing.get('DormStyle', '')),
                str(listing.get('description', '')),
                str(listing.get('address', '')),
                str(listing.get('lookingFor', '')),
            ]).lower()
        ]

    if dorm_type:
        filter_value = dorm_type.strip().lower()
        filtered_listings = [
            listing for listing in filtered_listings
            if str(listing.get('DormType', '')).strip().lower() == filter_value
        ]

    if dorm_style:
        filter_value = dorm_style.strip().lower()
        filtered_listings = [
            listing for listing in filtered_listings
            if str(listing.get('DormStyle', '')).strip().lower() == filter_value
        ]

    if min_price is not None:
        filtered_listings = [
            listing for listing in filtered_listings
            if listing.get('priceValue') is not None and listing['priceValue'] >= min_price
        ]

    if max_price is not None:
        filtered_listings = [
            listing for listing in filtered_listings
            if listing.get('priceValue') is not None and listing['priceValue'] <= max_price
        ]

    sort_option = (sort or '').lower().strip()
    if sort_option == 'price-asc':
        filtered_listings = sorted(filtered_listings, key=lambda x: (x.get('priceValue') is None, x.get('priceValue') or 0))
    elif sort_option == 'price-desc':
        filtered_listings = sorted(filtered_listings, key=lambda x: (x.get('priceValue') is None, -(x.get('priceValue') or 0)))
    elif sort_option == 'building-asc':
        filtered_listings = sorted(filtered_listings, key=lambda x: str(x.get('building', '')).lower())
    else:
        filtered_listings = sorted(filtered_listings, key=lambda x: str(x.get('createdAt', '')), reverse=True)
    
    if _limit is not None and _limit >= 0:
        return filtered_listings[:_limit]

    return filtered_listings

@app.post("/api/listings")
async def create_listing(request: Request):
    """Create a new listing (requires authentication)"""
    session_token = request.cookies.get('session_token')
    
    if not session_token or session_token not in sessions:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    user_data = sessions[session_token]
    email = user_data['email']
    
    listing_data = await request.json()
    listing_data['createdAt'] = datetime.now().isoformat()
    
    # Generate unique listing ID
    import uuid
    listing_id = f"user_{uuid.uuid4().hex[:8]}"
    
    # Store listing with user association
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
        listing_data = normalize_listing(
            listing_info['listing_data'],
            default_id=listing_id,
            is_user_listing=True,
            user_email=listing_info['user_email']
        )
        listing_data['createdAt'] = listing_info.get('created_at', listing_data.get('createdAt'))
        return listing_data
    
    # Fall back to listings.json
    data = load_seed_data()
    listings = data.get('listings', [])
    for index, listing in enumerate(listings):
        if listing.get('id') == listing_id:
            return normalize_listing(listing, default_id=str(listing.get('id', f"seed_{index}")))
    
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
