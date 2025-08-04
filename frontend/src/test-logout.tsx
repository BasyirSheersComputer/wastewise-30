import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const TestLogout: React.FC = () => {
  const navigate = useNavigate();

  const testLogout = async () => {
    try {
      console.log('Testing logout functionality...');
      await supabase.auth.signOut();
      console.log('Logout successful, redirecting to login...');
      navigate('/login');
    } catch (error) {
      console.error('Logout test failed:', error);
      // Still redirect to login even if there's an error
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-text-primary mb-6">
          Logout Test
        </h1>
        
        <div className="glass-card p-6">
          <p className="text-text-secondary mb-4">
            This test verifies that logout functionality redirects to the login page.
          </p>
          
          <button
            onClick={testLogout}
            className="glass-button w-full"
          >
            Test Logout
          </button>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <h3 className="font-semibold text-blue-800 mb-2">Expected Behavior:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• User session is cleared</li>
              <li>• Redirect to /login page</li>
              <li>• User can log back in</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestLogout; 