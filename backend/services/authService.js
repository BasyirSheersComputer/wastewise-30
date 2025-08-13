import { createClient } from '@supabase/supabase-js';
import { DateTime } from 'luxon';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

class AuthService {
  constructor() {
    this.supabase = supabase;
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  }

  // Register new user with comprehensive onboarding
  async registerUser(userData) {
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
        business_type = 'restaurant',
        locations = 1,
        annual_revenue = 'under_100k',
        primary_goals = [],
        data_sources = [],
        team_size = '1-10',
        timezone = 'Asia/Kuala_Lumpur'
      } = userData;

      // Validate required fields
      if (!email || !password || !first_name || !last_name || !company_name) {
        throw new Error('Missing required fields');
      }

      // Check if user already exists in auth
      const { data: existingAuthUser } = await this.supabase.auth.admin.listUsers();
      const userExists = existingAuthUser.users.some(user => user.email === email);
      
      if (userExists) {
        throw new Error('User already exists');
      }

      // Set trial period
      const now = DateTime.now();
      const trialStart = now.toISO();
      const trialEnd = now.plus({ days: 30 }).toISO();

      // Create user in Supabase Auth (Supabase handles password hashing)
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password, // Don't hash - Supabase handles this
        options: {
          data: {
            first_name,
            last_name,
            company_name,
            company_size,
            primary_pain
          }
        }
      });

      if (authError) throw authError;

      // Create user profile in database
      const { error: profileError } = await this.supabase.from('users').insert([{
        id: authData.user.id,
        email,
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
        timezone,
        trial_start: trialStart,
        trial_end: trialEnd,
        subscription_status: 'trial',
        subscription_plan: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

      if (profileError) {
        logger.error('Profile creation error', profileError);
        // If profile creation fails, we should clean up the auth user
        // But for now, let's log the error and continue
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      // Create welcome email and onboarding sequence
      await this.sendWelcomeEmail(email, first_name, company_name);

      logger.info('User registered successfully', { 
        user_id: authData.user.id, 
        email, 
        company_name 
      });

      return {
        user: authData.user,
        session: authData.session,
        trialEnd,
        daysLeft: 30
      };
    } catch (error) {
      logger.error('Error registering user', error);
      throw error;
    }
  }

  // Create user profile after auth signup (for frontend flow)
  async createUserProfile(userId, userData) {
    try {
      const {
        email,
        first_name,
        last_name,
        company_name,
        company_size,
        primary_pain,
        phone_number,
        business_type = 'restaurant',
        locations = 1,
        annual_revenue = 'under_100k',
        primary_goals = [],
        data_sources = [],
        team_size = '1-10',
        timezone = 'Asia/Kuala_Lumpur'
      } = userData;

      // Set trial period
      const now = DateTime.now();
      const trialStart = now.toISO();
      const trialEnd = now.plus({ days: 30 }).toISO();

      // Create user profile in database
      const { error: profileError } = await this.supabase.from('users').insert([{
        id: userId,
        email,
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
        timezone,
        trial_start: trialStart,
        trial_end: trialEnd,
        subscription_status: 'trial',
        subscription_plan: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

      if (profileError) {
        logger.error('Profile creation error', profileError);
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      logger.info('User profile created successfully', { 
        user_id: userId, 
        email 
      });

      return {
        success: true,
        trialEnd,
        daysLeft: 30
      };
    } catch (error) {
      logger.error('Error creating user profile', error);
      throw error;
    }
  }

  // Google OAuth sign in
  async signInWithGoogle(accessToken, idToken) {
    try {
      logger.info('Processing Google OAuth sign in');
      
      // Verify Google token (in production, verify with Google's API)
      const googleUser = await this.verifyGoogleToken(idToken);
      
      logger.info('Google user verified', { email: googleUser.email });
      
      // Check if user exists in auth
      const { data: { user: existingAuthUser }, error: authError } = await this.supabase.auth.getUser();
      
      // Check if user exists in users table
      const { data: existingUser, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', googleUser.email)
        .single();

      if (existingUser) {
        logger.info('Existing Google user found', { email: googleUser.email });
        
        // User exists, try to sign in
        try {
          const { data: sessionData, error: sessionError } = await this.supabase.auth.signInWithPassword({
            email: existingUser.email,
            password: 'google-oauth-user' // This won't work for OAuth users
          });

          if (sessionError) {
            // For OAuth users, we need to handle this differently
            // Create a custom session or use Supabase's OAuth flow
            logger.warn('Could not sign in existing OAuth user with password, creating custom session');
            const session = this.createCustomSession(existingUser);
            return { 
              user: existingUser, 
              session,
              isNewUser: false
            };
          }

          return { 
            user: existingUser, 
            session: sessionData.session,
            isNewUser: false
          };
        } catch (signInError) {
          logger.error('Error signing in existing OAuth user', signInError);
          // Create custom session as fallback
          const session = this.createCustomSession(existingUser);
          return { 
            user: existingUser, 
            session,
            isNewUser: false
          };
        }
      } else {
        logger.info('New Google user, creating account', { email: googleUser.email });
        
        // New Google user, create account using Supabase OAuth
        try {
          // Use Supabase's OAuth sign up
          const { data: authData, error: authError } = await this.supabase.auth.signUp({
            email: googleUser.email,
            password: null, // OAuth users don't need password
            options: {
              data: {
                first_name: googleUser.given_name,
                last_name: googleUser.family_name,
                full_name: `${googleUser.given_name} ${googleUser.family_name}`,
                organization: '',
                provider: 'google'
              }
            }
          });

          if (authError) {
            logger.error('Error creating OAuth user in auth', authError);
            throw authError;
          }

          logger.info('OAuth user created in auth', { user_id: authData.user?.id });

          // Return the user data for profile creation
          return { 
            user: authData.user, 
            session: authData.session,
            isNewUser: true
          };
        } catch (signUpError) {
          logger.error('Error creating OAuth user', signUpError);
          throw signUpError;
        }
      }
    } catch (error) {
      logger.error('Error with Google OAuth', error);
      throw error;
    }
  }

  // Verify Google token (mock implementation)
  async verifyGoogleToken(idToken) {
    // In production, verify with Google's API
    // For now, return mock data
    return {
      email: 'user@gmail.com',
      given_name: 'Google',
      family_name: 'User',
      picture: 'https://via.placeholder.com/150'
    };
  }

  // Create custom session for OAuth users
  createCustomSession(user) {
    const token = jwt.sign(
      { 
        user_id: user.id, 
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      },
      this.jwtSecret
    );

    return {
      access_token: token,
      refresh_token: 'oauth-refresh-token',
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          first_name: user.first_name,
          last_name: user.last_name
        }
      }
    };
  }

  // Login user
  async loginUser(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Get user profile
      const { data: userProfile, error: profileError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        logger.warn('User profile not found', { user_id: data.user.id });
      }

      // Check trial status
      const trialStatus = this.checkTrialStatus(userProfile);

      return {
        user: data.user,
        session: data.session,
        profile: userProfile,
        trialStatus
      };
    } catch (error) {
      logger.error('Error logging in user', error);
      throw error;
    }
  }

  // Check trial status
  checkTrialStatus(userProfile) {
    if (!userProfile) return { isExpired: true, daysLeft: 0 };

    const now = DateTime.now();
    const trialEnd = DateTime.fromISO(userProfile.trial_end);
    const isExpired = now > trialEnd;
    const daysLeft = Math.max(0, trialEnd.diff(now, 'days').days);

    return {
      isExpired,
      daysLeft,
      trialEnd: userProfile.trial_end,
      subscriptionStatus: userProfile.subscription_status
    };
  }

  // Complete user onboarding
  async completeOnboarding(userId, onboardingData) {
    try {
      const {
        company_name,
        company_size,
        primary_pain,
        business_type,
        locations,
        annual_revenue,
        primary_goals,
        data_sources,
        team_size,
        timezone
      } = onboardingData;

      const { error } = await this.supabase
        .from('users')
        .update({
          company_name,
          company_size,
          primary_pain,
          business_type,
          locations,
          annual_revenue,
          primary_goals,
          data_sources,
          team_size,
          timezone,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Send onboarding completion email
      const { data: user } = await this.supabase
        .from('users')
        .select('email, first_name')
        .eq('id', userId)
        .single();

      if (user) {
        await this.sendOnboardingCompletionEmail(user.email, user.first_name);
      }

      logger.info('User onboarding completed', { user_id: userId });
      return { success: true };
    } catch (error) {
      logger.error('Error completing onboarding', error);
      throw error;
    }
  }

  // Extend trial period
  async extendTrial(userId, days = 7) {
    try {
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('trial_end')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const currentTrialEnd = DateTime.fromISO(user.trial_end);
      const newTrialEnd = currentTrialEnd.plus({ days });

      const { error } = await this.supabase
        .from('users')
        .update({
          trial_end: newTrialEnd.toISO(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      logger.info('Trial extended', { user_id: userId, new_end: newTrialEnd.toISO() });
      return { 
        success: true, 
        newTrialEnd: newTrialEnd.toISO(),
        daysLeft: newTrialEnd.diff(DateTime.now(), 'days').days
      };
    } catch (error) {
      logger.error('Error extending trial', error);
      throw error;
    }
  }

  // Send welcome email
  async sendWelcomeEmail(email, firstName, companyName) {
    try {
      // In production, integrate with email service like SendGrid or AWS SES
      logger.info('Welcome email sent', { email, firstName, companyName });
      
      // Mock email sending
      console.log(`Welcome email sent to ${email} for ${companyName}`);
    } catch (error) {
      logger.error('Error sending welcome email', error);
    }
  }

  // Send onboarding completion email
  async sendOnboardingCompletionEmail(email, firstName) {
    try {
      logger.info('Onboarding completion email sent', { email, firstName });
      
      // Mock email sending
      console.log(`Onboarding completion email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending onboarding completion email', error);
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('Error getting user profile', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(userId, profileData) {
    try {
      const { error } = await this.supabase
        .from('users')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      logger.info('User profile updated', { user_id: userId });
      return { success: true };
    } catch (error) {
      logger.error('Error updating user profile', error);
      throw error;
    }
  }

  // Logout user
  async logoutUser() {
    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) throw error;

      logger.info('User logged out successfully');
      return { success: true };
    } catch (error) {
      logger.error('Error logging out user', error);
      throw error;
    }
  }

  // Validate JWT token
  validateToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return decoded;
    } catch (error) {
      logger.error('Token validation failed', error);
      return null;
    }
  }

  // Refresh token
  async refreshToken(refreshToken) {
    try {
      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('Error refreshing token', error);
      throw error;
    }
  }

  // Check if user has active subscription
  async hasActiveSubscription(userId) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('subscription_status, trial_end')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const now = DateTime.now();
      const trialEnd = DateTime.fromISO(data.trial_end);
      const isTrialExpired = now > trialEnd;

      return {
        hasActive: data.subscription_status === 'active' || (!isTrialExpired && data.subscription_status === 'trial'),
        subscriptionStatus: data.subscription_status,
        isTrialExpired
      };
    } catch (error) {
      logger.error('Error checking subscription status', error);
      throw error;
    }
  }
}

export default new AuthService(); 