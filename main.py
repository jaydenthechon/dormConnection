from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.responses import Response  # Add missing import for Response
from onelogin.saml.auth import OneLogin_Saml2_Auth
from onelogin.saml.utils import OneLogin_Saml2_Utils
from urllib.parse import urlparse  # Add missing import for urlparse

app = FastAPI()

def init_saml_auth(req):
    auth = OneLogin_Saml2_Auth(req, custom_base_path="/path/to/saml")
    return auth

async def prepare_flask_request(request: Request):
    url_data = urlparse(str(request.url))
    form_data = await request.form()  # Correctly parse form data in FastAPI
    return {
        'https': 'on' if request.url.scheme == 'https' else 'off',
        'http_host': request.url.netloc,
        'script_name': request.url.path,
        'server_port': url_data.port or ('443' if request.url.scheme == 'https' else '80'),
        'get_data': dict(request.query_params),
        'post_data': dict(form_data)
    }

@app.post('/sso/login')
async def sso_login(request: Request):
    req = prepare_flask_request(request)
    auth = init_saml_auth(req)
    return RedirectResponse(auth.login())

@app.post('/sso/acs')
async def sso_acs(request: Request):
    req = prepare_flask_request(request)
    auth = init_saml_auth(req)
    auth.process_response()
    errors = auth.get_errors()
    if len(errors) == 0:
        if auth.is_authenticated():
            user_email = auth.get_nameid()
            if user_email.endswith('@bu.edu'):
                # Set session or token for authenticated user
                return {"message": "Login successful", "email": user_email}
            else:
                raise HTTPException(status_code=403, detail="Invalid email domain")
        else:
            raise HTTPException(status_code=401, detail="Authentication failed")
    else:
        raise HTTPException(status_code=400, detail="SAML response error")

@app.get('/sso/metadata')
async def sso_metadata():
    auth = init_saml_auth({})
    settings = auth.get_settings()
    metadata = settings.get_sp_metadata()
    errors = settings.validate_metadata(metadata)
    if len(errors) == 0:
        return Response(content=metadata, media_type='text/xml')
    else:
        raise HTTPException(status_code=500, detail="Invalid metadata")
