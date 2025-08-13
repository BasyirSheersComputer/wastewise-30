import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { CheckCircle, ArrowRight, Mail } from 'lucide-react';

export default function EmailConfirmation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          setError('Authentication error. Please try signing in again.');
          return;
        }

        if (user) {
          setUser(user);
          
          // Check if email is confirmed
          if (user.email_confirmed_at) {
            // Check for pending signup
            const pendingSignup = localStorage.getItem('pendingSignup');
            if (pendingSignup) {
              try {
                const { user: pendingUser } = JSON.parse(pendingSignup);
                if (pendingUser.id === user.id) {
                  // This is a confirmed user with pending signup
                  console.log('Email confirmed, redirecting to onboarding');
                  navigate('/onboarding');
                  return;
                }
              } catch (error) {
                console.error('Error processing pending signup:', error);
                localStorage.removeItem('pendingSignup');
              }
            }
            
            // User is confirmed but no pending signup, go to dashboard
            navigate('/dashboard');
            return;
          } else {
            setError('Email not yet confirmed. Please check your email and click the confirmation link.');
          }
        } else {
          setError('No user found. Please sign in to continue.');
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        setError('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, [navigate]);

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleResendConfirmation = async () => {
    if (!user?.email) return;
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      });
      
      if (error) throw error;
      
      alert('Confirmation email sent! Please check your inbox.');
    } catch (error) {
      console.error('Error resending confirmation:', error);
      alert('Failed to resend confirmation email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your email confirmation status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {error ? (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Confirmation Required</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              
              <div className="space-y-3">
                <button
                  onClick={handleResendConfirmation}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Sending...' : 'Resend Confirmation Email'}
                </button>
                
                <button
                  onClick={handleSignIn}
                  className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Sign In Instead
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Confirmed!</h1>
              <p className="text-gray-600 mb-6">
                Your email has been successfully confirmed. You can now complete your account setup.
              </p>
              
              <button
                onClick={() => navigate('/onboarding')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center"
              >
                Complete Setup
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </>
          )}
        </div>
        
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

