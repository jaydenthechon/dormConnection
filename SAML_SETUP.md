# SAML2 Authentication Setup for DormConnection (@bu.edu only)

This guide explains how to set up SAML2 authentication with Boston University's identity provider for the DormConnection application.

## Overview

The application is configured to allow **only @bu.edu email addresses** to authenticate. The SAML integration uses:
- **FastAPI** backend for SAML authentication
- **python3-saml** library for SAML protocol handling
- **React** frontend with protected routes
- BU's Shibboleth Identity Provider

## Prerequisites

1. Python 3.8 or higher
2. Node.js 16 or higher
3. BU IT approval for SAML integration
4. SSL certificate for production (SAML requires HTTPS)

## Installation

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

The `requirements.txt` includes:
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `python3-saml` - SAML library
- `python-dotenv` - Environment configuration
- `pydantic` - Data validation

### 2. Install Node Dependencies

```bash
npm install
```

## Configuration

### 1. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
ENVIRONMENT=development
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000

# Update these with your production domain
SAML_SP_ENTITY_ID=https://your-domain.com/metadata
SAML_SP_ACS_URL=https://your-domain.com/api/saml/acs
SAML_SP_SLO_URL=https://your-domain.com/api/saml/slo

SESSION_SECRET=generate-a-random-secret-key-here
```

### 2. SAML Configuration

#### Get BU IdP Certificate

Contact BU IT Services to obtain:
1. The IdP X.509 certificate
2. Approval to integrate your service
3. Verification of the correct IdP URLs

**BU IT Contact:**
- Website: https://www.bu.edu/tech/support/
- Email: ithelp@bu.edu

#### Update `saml/settings.json`

Replace the placeholder values:

```json
{
  "sp": {
    "entityId": "https://your-production-domain.com/metadata",
    "assertionConsumerService": {
      "url": "https://your-production-domain.com/api/saml/acs"
    },
    "singleLogoutService": {
      "url": "https://your-production-domain.com/api/saml/slo"
    }
  },
  "idp": {
    "entityId": "https://shib.bu.edu/idp/shibboleth",
    "singleSignOnService": {
      "url": "https://shib.bu.edu/idp/profile/SAML2/Redirect/SSO"
    },
    "x509cert": "PASTE_BU_CERTIFICATE_HERE"
  }
}
```

#### Generate SP Certificates (Production Only)

For production, generate your own X.509 certificates:

```bash
# Generate private key
openssl genrsa -out saml.key 2048

# Generate certificate
openssl req -new -x509 -key saml.key -out saml.crt -days 3650

# Add to settings.json
# Convert to single line (remove newlines and BEGIN/END headers)
```

### 3. Register with BU

You need to register your Service Provider with BU's Identity Provider:

1. **Generate your SP metadata:**
   ```bash
   # Start your backend server
   python main.py
   
   # Access metadata endpoint
   curl http://localhost:8000/api/saml/metadata > sp_metadata.xml
   ```

2. **Submit to BU IT:**
   - Send the `sp_metadata.xml` file to BU IT Services
   - Request integration with Shibboleth IdP
   - Specify that you need email attribute (typically `urn:oid:0.9.2342.19200300.100.1.3`)
   - Mention this is for BU student housing application

3. **Wait for approval:**
   - BU IT will review your request
   - They will configure their IdP to trust your SP
   - You'll receive confirmation when setup is complete

## Running the Application

### Development Mode

1. **Start the FastAPI backend:**
   ```bash
   python main.py
   ```
   Backend runs on http://localhost:8000

2. **Start the Vite dev server:**
   ```bash
   npm run dev
   ```
   Frontend runs on http://localhost:5173

### Production Deployment

#### Important Security Considerations:

1. **HTTPS is Required:**
   - SAML requires secure communication
   - Use Let's Encrypt for free SSL certificates
   - Configure nginx or Apache as reverse proxy

2. **Session Management:**
   - Current implementation uses in-memory sessions
   - For production, use Redis or database:
     ```python
     # Example with Redis
     import redis
     r = redis.Redis(host='localhost', port=6379)
     ```

3. **CORS Configuration:**
   - Update `main.py` CORS settings for production domain
   - Never use `allow_origins=["*"]` in production

## Email Domain Validation

The authentication enforces @bu.edu email domain in `main.py`:

```python
def validate_bu_email(email: str) -> bool:
    """Validate that email is from bu.edu domain"""
    return email.lower().endswith('@bu.edu')
```

Users with non-BU emails will be rejected with an error message.

## Testing

### Local Testing Without BU IdP

For development without BU IdP access, you can:

1. Mock the SAML response in `main.py`
2. Create a test route that simulates authentication
3. Use tools like SAML-tracer browser extension

### Testing with BU IdP

1. Ensure you're on BU network or VPN
2. Navigate to http://localhost:5173/login
3. Click "Sign in with BU Account"
4. You'll be redirected to BU's login page
5. Login with BU credentials
6. You'll be redirected back to the app

## Troubleshooting

### "Invalid domain" error
- Check that the email returned by IdP ends with @bu.edu
- Verify the email attribute mapping in SAML response

### "SAML error"
- Check backend logs for detailed error messages
- Verify IdP certificate is correct
- Ensure all URLs use HTTPS in production

### "Not authenticated" error
- Check browser cookies are enabled
- Verify SAML response signature
- Check session storage

### IdP won't redirect back
- Verify ACS URL is correct and registered with BU
- Check that your SP metadata is properly configured in BU's IdP

## Architecture

### Authentication Flow

```
1. User clicks "Sign in with BU Account"
   ↓
2. Frontend redirects to /api/saml/login
   ↓
3. Backend generates SAML AuthnRequest
   ↓
4. User redirected to BU IdP (shib.bu.edu)
   ↓
5. User authenticates with BU credentials
   ↓
6. IdP sends SAML response to /api/saml/acs
   ↓
7. Backend validates response and checks @bu.edu domain
   ↓
8. Session created, user redirected to frontend
   ↓
9. Frontend checks authentication state
   ↓
10. User accesses protected routes
```

### Protected Routes

To protect a route, wrap it with `ProtectedRoute`:

```jsx
import ProtectedRoute from './components/ProtectedRoute';

<Route 
  path="/add-listings" 
  element={
    <ProtectedRoute>
      <AddListingPage />
    </ProtectedRoute>
  } 
/>
```

### Authentication Context

The `AuthContext` provides authentication state across the app:

```jsx
import { useAuth } from './context/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated && <p>Welcome, {user.email}</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/saml/login` | GET | Initiate SAML login flow |
| `/api/saml/acs` | POST | Assertion Consumer Service (callback) |
| `/api/saml/slo` | GET | Single Logout Service |
| `/api/saml/metadata` | GET | SP metadata XML |
| `/api/auth/user` | GET | Get current user info |
| `/api/auth/logout` | POST | Logout current user |

## Security Best Practices

1. **Never commit sensitive data:**
   - Add `.env` to `.gitignore`
   - Never commit private keys or certificates
   - Use environment variables for all secrets

2. **Validate all inputs:**
   - SAML response validation is critical
   - Always verify signature and assertions
   - Check certificate expiration

3. **Secure session management:**
   - Use httpOnly cookies
   - Set secure flag in production
   - Implement session timeout
   - Consider using JWT with short expiration

4. **Monitor and log:**
   - Log all authentication attempts
   - Monitor for suspicious activity
   - Set up alerts for failed authentications

## Support

For issues related to:
- **BU SAML/Shibboleth:** Contact BU IT Services (ithelp@bu.edu)
- **Application Issues:** Contact your development team
- **SAML Protocol:** Refer to python3-saml documentation

## Additional Resources

- [BU IT Support](https://www.bu.edu/tech/support/)
- [python3-saml Documentation](https://github.com/onelogin/python3-saml)
- [SAML 2.0 Specification](http://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

## License

This integration is specific to Boston University's SAML infrastructure and should only be used for BU-authorized applications.
