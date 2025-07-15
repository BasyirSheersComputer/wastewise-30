import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    // Insert into profiles table
    const user = data.user;
    if (user) {
      const { error: profileError } = await supabase.from('profiles').insert([
        { id: user.id, email, full_name: fullName, role: 'staff' }
      ]);
      if (profileError) {
        setLoading(false);
        setError(profileError.message);
        return;
      }
    }
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="glass-card p-lg w-full max-w-sm space-y-md">
        <h2 className="text-xl font-semibold text-text-primary mb-md">{isSignUp ? 'Sign Up' : 'Login'}</h2>
        {isSignUp && (
          <input
            type="text"
            placeholder="Full Name"
            className="glass-input w-full"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          className="glass-input w-full"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="glass-input w-full"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-error text-sm">{error}</div>}
        <button type="submit" className="glass-button w-full" disabled={loading}>
          {loading ? (isSignUp ? 'Signing up...' : 'Logging in...') : (isSignUp ? 'Sign Up' : 'Login')}
        </button>
        <div className="text-sm text-text-secondary text-center">
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <button type="button" className="text-primary underline" onClick={() => setIsSignUp(false)}>
                Login
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button type="button" className="text-primary underline" onClick={() => setIsSignUp(true)}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login; 