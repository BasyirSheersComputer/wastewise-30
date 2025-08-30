import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { DateTime } from 'luxon';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const router = express.Router();

// Create Supabase client only if environment variables are available
let supabase = null;
try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    logger.info('User route: Supabase client created successfully');
  } else {
    logger.warn('User route: Supabase environment variables not found, user features will be disabled');
  }
} catch (error) {
  logger.error('User route: Failed to create Supabase client:', error.message);
}

// Get user profile
router.get('/profile', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: 'User service unavailable' });
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get additional user data from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      return res.status(500).json({ error: userError.message });
    }

    res.json({ 
      user: {
        ...user,
        ...userData
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: 'User service unavailable' });
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { name, company, size, pain } = req.body;

    // Update auth user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: { name, company, size, pain }
    });

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // Update users table
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        name,
        company,
        size,
        pain,
        updated_at: new Date().toISOString()
      });

    if (userError) {
      return res.status(400).json({ error: userError.message });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user trial status
router.get('/trial-status', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: 'User service unavailable' });
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('trial_start, trial_end')
      .eq('id', user.id)
      .single();

    if (userError) {
      return res.status(500).json({ error: userError.message });
    }

    const now = DateTime.now();
    const trialEnd = DateTime.fromISO(userData.trial_end);
    const isExpired = now > trialEnd;
    const daysLeft = Math.max(0, trialEnd.diff(now, 'days').days);

    res.json({
      trialStart: userData.trial_start,
      trialEnd: userData.trial_end,
      isExpired,
      daysLeft: Math.floor(daysLeft)
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user account
router.delete('/account', async (req, res) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Delete from users table
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    if (userError) {
      return res.status(400).json({ error: userError.message });
    }

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(user.id);

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
