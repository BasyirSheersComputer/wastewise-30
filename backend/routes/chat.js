/**
 * Chat/FAQ API Routes
 * Handles chat sessions, FAQ queries, and escalations
 */

import express from 'express';
import { authenticateUser } from '../utils/authMiddleware.js';
import FAQChatService from '../services/faqChatService.js';
import { supabase } from '../services/supabaseClient.js';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const faqChatService = new FAQChatService({ supabase, useLLM: true });

/**
 * Create or get chat session
 */
router.post('/session', authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const sessionKey = uuidv4();

    if (!supabase) {
      return res.json({
        success: true,
        session: {
          id: sessionKey,
          session_key: sessionKey,
          user_id: userId,
          status: 'active'
        }
      });
    }

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        session_key: sessionKey,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      session: data
    });
  } catch (error) {
    logger.error('Session creation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create chat session'
    });
  }
});

/**
 * Get chat session messages
 */
router.get('/session/:sessionId/messages', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50 } = req.query;

    if (!supabase) {
      return res.json({
        success: true,
        messages: []
      });
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({
      success: true,
      messages: data || []
    });
  } catch (error) {
    logger.error('Failed to get messages:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get messages'
    });
  }
});

/**
 * Send message and get FAQ response
 */
router.post('/message', authenticateUser, async (req, res) => {
  try {
    const { sessionId, message, userId } = req.body;
    const effectiveUserId = userId || req.user?.id || null;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and message are required'
      });
    }

    // Process message through FAQ system
    const result = await faqChatService.processMessage(
      sessionId,
      effectiveUserId,
      message
    );

    // Check if should escalate
    const shouldEscalate = await faqChatService.shouldEscalate(sessionId);
    
    if (shouldEscalate && !result.should_escalate) {
      result.suggestion = 'Would you like me to connect you with a customer representative?';
      result.can_escalate = true;
    }

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Message processing failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process message'
    });
  }
});

/**
 * Escalate to customer rep
 */
router.post('/escalate', authenticateUser, async (req, res) => {
  try {
    const { sessionId, reason } = req.body;
    const userId = req.user?.id || null;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const result = await faqChatService.escalateToRep(
      sessionId,
      userId,
      reason || 'User requested escalation'
    );

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Escalation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to escalate'
    });
  }
});

/**
 * Record user satisfaction
 */
router.post('/satisfaction', authenticateUser, async (req, res) => {
  try {
    const { messageId, isSatisfied } = req.body;

    if (messageId === undefined || isSatisfied === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Message ID and satisfaction status are required'
      });
    }

    const result = await faqChatService.recordSatisfaction(messageId, isSatisfied);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Satisfaction recording failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to record satisfaction'
    });
  }
});

/**
 * Search FAQ articles
 */
router.get('/faq/search', async (req, res) => {
  try {
    const { query, category, limit = 10 } = req.query;

    if (!supabase) {
      return res.json({
        success: true,
        articles: []
      });
    }

    let supabaseQuery = supabase
      .from('faq_articles')
      .select(`
        *,
        faq_categories(name)
      `)
      .eq('is_active', true)
      .limit(parseInt(limit));

    if (query) {
      const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      supabaseQuery = supabaseQuery.or(
        `keywords.cs.{${keywords.join(',')}},title.ilike.%${keywords[0]}%,content.ilike.%${keywords[0]}%`
      );
    }

    if (category) {
      supabaseQuery = supabaseQuery.eq('category_id', category);
    }

    const { data, error } = await supabaseQuery;

    if (error) throw error;

    res.json({
      success: true,
      articles: (data || []).map(article => ({
        id: article.id,
        title: article.title,
        content: article.content,
        category: article.faq_categories?.name || 'General',
        keywords: article.keywords,
        view_count: article.view_count,
        helpful_count: article.helpful_count
      }))
    });
  } catch (error) {
    logger.error('FAQ search failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to search FAQ'
    });
  }
});

/**
 * Get FAQ categories
 */
router.get('/faq/categories', async (req, res) => {
  try {
    if (!supabase) {
      return res.json({
        success: true,
        categories: []
      });
    }

    const { data, error } = await supabase
      .from('faq_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      categories: data || []
    });
  } catch (error) {
    logger.error('Failed to get categories:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get categories'
    });
  }
});

/**
 * Get FAQ article by ID
 */
router.get('/faq/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;

    if (!supabase) {
      return res.status(404).json({
        success: false,
        error: 'FAQ article not found'
      });
    }

    const { data, error } = await supabase
      .from('faq_articles')
      .select(`
        *,
        faq_categories(name)
      `)
      .eq('id', articleId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'FAQ article not found'
      });
    }

    // Increment view count
    await supabase
      .from('faq_articles')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', articleId);

    res.json({
      success: true,
      article: {
        id: data.id,
        title: data.title,
        content: data.content,
        category: data.faq_categories?.name || 'General',
        keywords: data.keywords,
        tags: data.tags,
        view_count: data.view_count + 1,
        helpful_count: data.helpful_count
      }
    });
  } catch (error) {
    logger.error('Failed to get FAQ article:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get FAQ article'
    });
  }
});

export default router;

