import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import authService from '../services/authService.js';
import logger from '../utils/logger.js';

dotenv.config();

const router = express.Router();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// User registration with comprehensive onboarding
router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      company_name,
      company_size,
      primary_pain,
      phone_number,
      business_type,
      locations,
      annual_revenue,
      primary_goals,
      data_sources,
      team_size,
      timezone
    } = req.body;

    const userData = {
      email,
      password,
      first_name,
      last_name,
      company_name,
      company_size,
      primary_pain,
      phone_number,
      business_type,
      locations,
      annual_revenue,
      primary_goals,
      data_sources,
      team_size,
      timezone
    };

    const result = await authService.registerUser(userData);

    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      session: result.session,
      trialEnd: result.trialEnd,
      daysLeft: result.daysLeft
    });
  } catch (error) {
    logger.error('Registration error', error);
    res.status(400).json({ error: error.message });
  }
});

// Create user profile after frontend signup
router.post('/create-profile', async (req, res) => {
  try {
    const { user } = req.body;
    
    if (!user || !user.id || !user.email) {
      return res.status(400).json({ error: 'Invalid user data' });
    }

    // Extract user data from auth user metadata
    const userData = {
      email: user.email,
      first_name: user.user_metadata?.first_name || '',
      last_name: user.user_metadata?.last_name || '',
      company_name: user.user_metadata?.company_name || '',
      company_size: user.user_metadata?.company_size || '',
      primary_pain: user.user_metadata?.primary_pain || '',
      phone_number: user.user_metadata?.phone_number || '',
      business_type: 'restaurant',
      locations: 1,
      annual_revenue: 'under_100k',
      primary_goals: [],
      data_sources: [],
      team_size: '1-10',
      timezone: 'Asia/Kuala_Lumpur'
    };

    const result = await authService.createUserProfile(user.id, userData);

    res.status(201).json({
      message: 'User profile created successfully',
      trialEnd: result.trialEnd,
      daysLeft: result.daysLeft
    });
  } catch (error) {
    logger.error('Profile creation error', error);
    res.status(400).json({ error: error.message });
  }
});

// Google OAuth sign in
router.post('/google', async (req, res) => {
  try {
    const { access_token, id_token } = req.body;

    if (!access_token || !id_token) {
      return res.status(400).json({ error: 'Missing Google tokens' });
    }

    const result = await authService.signInWithGoogle(access_token, id_token);

    res.json({
      message: 'Google sign in successful',
      user: result.user,
      session: result.session
    });
  } catch (error) {
    logger.error('Google OAuth error', error);
    res.status(400).json({ error: error.message });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await authService.loginUser(email, password);

    res.json({
      message: 'Login successful',
      user: result.user,
      session: result.session,
      profile: result.profile,
      trialStatus: result.trialStatus
    });
  } catch (error) {
    logger.error('Login error', error);
    res.status(401).json({ error: error.message });
  }
});

// User logout
router.post('/logout', async (req, res) => {
  try {
    await authService.logoutUser();
    res.json({ message: 'Logout successful' });
  } catch (error) {
    logger.error('Logout error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get user profile
    const profile = await authService.getUserProfile(user.id);

    res.json({ user, profile });
  } catch (error) {
    logger.error('Get user error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Complete onboarding
router.post('/onboarding', async (req, res) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = await authService.completeOnboarding(user.id, req.body);

    res.json({
      message: 'Onboarding completed successfully',
      ...result
    });
  } catch (error) {
    logger.error('Onboarding error', error);
    res.status(400).json({ error: error.message });
  }
});

// Extend trial
router.post('/extend-trial', async (req, res) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { days = 7 } = req.body;
    const result = await authService.extendTrial(user.id, days);

    res.json({
      message: 'Trial extended successfully',
      ...result
    });
  } catch (error) {
    logger.error('Extend trial error', error);
    res.status(400).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = await authService.updateUserProfile(user.id, req.body);

    res.json({
      message: 'Profile updated successfully',
      ...result
    });
  } catch (error) {
    logger.error('Update profile error', error);
    res.status(400).json({ error: error.message });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const result = await authService.refreshToken(refresh_token);

    res.json({
      message: 'Token refreshed successfully',
      session: result.session
    });
  } catch (error) {
    logger.error('Token refresh error', error);
    res.status(401).json({ error: error.message });
  }
});

// Check subscription status
router.get('/subscription-status', async (req, res) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = await authService.hasActiveSubscription(user.id);

    res.json(result);
  } catch (error) {
    logger.error('Subscription status error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate token
router.post('/validate', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    const decoded = authService.validateToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({
      valid: true,
      user: decoded
    });
  } catch (error) {
    logger.error('Token validation error', error);
    res.status(401).json({ error: 'Token validation failed' });
  }
});

export default router;
