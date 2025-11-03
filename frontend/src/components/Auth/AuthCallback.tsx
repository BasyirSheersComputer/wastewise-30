import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { Loader2 } from 'lucide-react';

/**
 * AuthCallback Component
 * Handles OAuth redirect callback from Supabase authentication
 * Supports Google OAuth and other providers
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash/query parameters from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        // Check for error in URL (Supabase passes errors this way)
        const error = hashParams.get('error') || queryParams.get('error');
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
        
        if (error) {
          console.error('OAuth error:', error, errorDescription);
          setStatus('error');
          setErrorMessage(errorDescription || 'Authentication failed. Please try again.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Get the session from Supabase (it should be set automatically)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          console.warn('No session found after OAuth callback');
          setStatus('error');
          setErrorMessage('Authentication session not found. Please try signing in again.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        console.log('✅ OAuth authentication successful:', session.user.email);
        setStatus('success');

        // Check if user profile exists
        const { data: existingUser, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error checking user profile:', profileError);
        }

        // If new user (no profile), redirect to onboarding
        if (!existingUser) {
          console.log('New user - redirecting to onboarding');
          setTimeout(() => navigate('/onboarding'), 500);
        } else {
          // Existing user - redirect to dashboard
          console.log('Existing user - redirecting to dashboard');
          setTimeout(() => navigate('/dashboard'), 500);
        }

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setErrorMessage('An unexpected error occurred. Please try signing in again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {status === 'processing' && (
            <>
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Completing Sign In...
              </h2>
              <p className="text-gray-600">
                Please wait while we set up your account
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Success!
              </h2>
              <p className="text-gray-600">
                Redirecting you to your dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-600 mb-4">
                {errorMessage}
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to login page...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

