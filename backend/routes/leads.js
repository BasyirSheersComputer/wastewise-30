/**
 * Leads Routes
 * Handles lead capture and submission from contact forms
 */

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import logger from '../utils/logger.js';

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  logger.info('Leads route: Supabase client created successfully', {});
}

/**
 * POST /api/leads/submit
 * Submit a new lead from contact form
 */
router.post('/submit', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      company, 
      message, 
      source,
      interest 
    } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    const leadData = {
      name,
      email,
      phone: phone || null,
      company: company || null,
      message: message || null,
      source: source || 'website',
      interest: interest || 'general',
      status: 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // If Supabase is available, save to database
    if (supabase) {
      const { data, error } = await supabase
        .from('leads')
        .insert([leadData])
        .select()
        .single();

      if (error) {
        logger.error('Error saving lead to database:', error);
        
        // If table doesn't exist, return success anyway (we log it)
        if (error.code === '42P01') {
          logger.warn('Leads table does not exist - lead not saved to database', leadData);
          return res.status(200).json({
            success: true,
            message: 'Thank you for your interest! We will contact you soon.',
            note: 'Lead captured but not persisted (database table missing)'
          });
        }

        return res.status(500).json({
          success: false,
          error: 'Failed to save lead'
        });
      }

      logger.info('Lead submitted successfully', { 
        leadId: data.id, 
        email: data.email 
      });

      return res.status(200).json({
        success: true,
        message: 'Thank you for your interest! We will contact you soon.',
        leadId: data.id
      });
    } else {
      // No database connection - just log and return success
      logger.warn('Supabase not configured - lead not saved to database', leadData);
      
      return res.status(200).json({
        success: true,
        message: 'Thank you for your interest! We will contact you soon.',
        note: 'Lead captured but not persisted (database not configured)'
      });
    }

  } catch (error) {
    logger.error('Error processing lead submission:', error);
    
    return res.status(500).json({
      success: false,
      error: 'An error occurred while processing your submission. Please try again.'
    });
  }
});

/**
 * GET /api/leads (admin only - for future implementation)
 * Get all leads
 */
router.get('/', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured'
      });
    }

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      if (error.code === '42P01') {
        return res.status(404).json({
          success: false,
          error: 'Leads table does not exist'
        });
      }

      throw error;
    }

    return res.status(200).json({
      success: true,
      leads: data,
      count: data.length
    });

  } catch (error) {
    logger.error('Error fetching leads:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch leads'
    });
  }
});

export default router;

