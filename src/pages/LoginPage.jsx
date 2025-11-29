import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for errors in URL params
    const errorParam = searchParams.get('error');
    const successParam = searchParams.get('success');

    if (errorParam === 'invalid_domain') {
      setError('Access denied. Only @bu.edu email addresses are allowed.');
    } else if (errorParam === 'not_authenticated') {
      setError('Authentication failed. Please try again.');
    } else if (errorParam === 'saml_error') {
      setError('SAML authentication error. Please contact support.');
    } else if (successParam === 'true') {
      // Check if user is authenticated
      fetch('/api/auth/user', {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          if (data.email) {
            navigate('/');
          }
        })
        .catch(() => {
          setError('Session error. Please try logging in again.');
        });
    }
  }, [searchParams, navigate]);

  const handleSamlLogin = () => {
    setLoading(true);
    // Redirect to SAML login endpoint
    window.location.href = '/api/saml/login';
  };

  return (
    <section className="bg-indigo-50 min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-700 mb-2">
            DormConnection
          </h1>
          <p className="text-gray-600">Boston University Student Housing</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleSamlLogin}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Redirecting...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Sign in with BU Account</span>
              </>
            )}
          </button>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>BU Students Only:</strong> You must use your @bu.edu email
              to access DormConnection.
            </p>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            <p>
              Need help?{' '}
              <a
                href="https://www.bu.edu/tech/support/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 underline"
              >
                Contact BU Tech Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;

