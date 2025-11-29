from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse, JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from onelogin.saml2.auth import OneLogin_Saml2_Auth
from onelogin.saml2.utils import OneLogin_Saml2_Utils
import os
from dotenv import load_dotenv
from urllib.parse import urlparse
import json

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
    return {"message": "DormConnection SAML Authentication API"}

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
    return {
        'email': user_data['email'],
        'attributes': user_data['attributes']
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
    """Get all listings"""
    # Load from listings.json or database
    try:
        with open('src/listings.json', 'r') as f:
            data = json.load(f)
        # Return the listings array from the JSON
        return data.get('listings', [])
    except FileNotFoundError:
        return []

@app.post("/api/listings")
async def create_listing(request: Request):
    """Create a new listing (requires authentication)"""
    session_token = request.cookies.get('session_token')
    
    if not session_token or session_token not in sessions:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    listing_data = await request.json()
    # Add logic to save listing
    return {"message": "Listing created", "data": listing_data}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
