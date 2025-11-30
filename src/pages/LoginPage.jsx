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
      setError('Access denied. Only Gmail accounts are allowed for testing.');
    } else if (errorParam === 'not_authenticated') {
      setError('Authentication failed. Please try again.');
    } else if (errorParam === 'auth_cancelled') {
      setError('Authentication was cancelled.');
    } else if (errorParam === 'oauth_error') {
      setError('OAuth authentication error. Please try again.');
    } else if (errorParam === 'no_code') {
      setError('No authorization code received.');
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

  const handleGoogleLogin = () => {
    setLoading(true);
    // Redirect to Google OAuth login endpoint
    window.location.href = '/api/auth/google/login';
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
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-gray-700"
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
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Testing Mode:</strong> Sign in with any Gmail account to test the application.
              In production, this will be restricted to @bu.edu emails only.
            </p>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            <p>
              Need help?{' '}
              <a
                href="https://support.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 underline"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;

