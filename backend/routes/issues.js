import express from 'express';
import issueReportingService from '../services/issueReportingService.js';
import { authenticateUser } from '../utils/authMiddleware.js';
import logger from '../utils/logger.js';

const router = express.Router();
/**
 * @route POST /api/issues
 * @desc Create a new issue
 * @access Private
 */
router.post('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      categoryId,
      priorityId,
      outletId,
      attachments = [],
      browserInfo,
      deviceInfo,
      pageUrl,
      userAgent,
      screenResolution
    } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        error: 'Title and description are required'
      });
    }

    const issueData = {
      title,
      description,
      categoryId,
      priorityId,
      outletId,
      attachments,
      browserInfo,
      deviceInfo,
      pageUrl,
      userAgent,
      screenResolution
    };

    const issue = await issueReportingService.createIssue(userId, issueData);

    res.status(201).json({
      message: 'Issue created successfully',
      issue
    });
  } catch (error) {
    logger.error('Error creating issue:', error);
    res.status(500).json({
      error: 'Failed to create issue',
      details: error.message
    });
  }
});

/**
 * @route GET /api/issues
 * @desc Get all issues for the authenticated user
 * @access Private
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = {
      status: req.query.status,
      category: req.query.category,
      priority: req.query.priority,
      outletId: req.query.outletId
    };

    const issues = await issueReportingService.getUserIssues(userId, filters);

    res.json({
      issues,
      count: issues.length
    });
  } catch (error) {
    logger.error('Error getting user issues:', error);
    res.status(500).json({
      error: 'Failed to get issues',
      details: error.message
    });
  }
});

/**
 * @route GET /api/issues/:id
 * @desc Get a specific issue with comments
 * @access Private
 */
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const issueId = req.params.id;

    const issue = await issueReportingService.getIssue(issueId, userId);

    res.json({
      issue
    });
  } catch (error) {
    logger.error('Error getting issue:', error);
    res.status(500).json({
      error: 'Failed to get issue',
      details: error.message
    });
  }
});

/**
 * @route PUT /api/issues/:id
 * @desc Update an issue
 * @access Private
 */
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const issueId = req.params.id;
    const updateData = req.body;

    const issue = await issueReportingService.updateIssue(issueId, userId, updateData);

    res.json({
      message: 'Issue updated successfully',
      issue
    });
  } catch (error) {
    logger.error('Error updating issue:', error);
    res.status(500).json({
      error: 'Failed to update issue',
      details: error.message
    });
  }
});

/**
 * @route DELETE /api/issues/:id
 * @desc Delete an issue (only if open)
 * @access Private
 */
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const issueId = req.params.id;

    const result = await issueReportingService.deleteIssue(issueId, userId);

    res.json({
      message: 'Issue deleted successfully',
      ...result
    });
  } catch (error) {
    logger.error('Error deleting issue:', error);
    res.status(500).json({
      error: 'Failed to delete issue',
      details: error.message
    });
  }
});

/**
 * @route POST /api/issues/:id/comments
 * @desc Add a comment to an issue
 * @access Private
 */
router.post('/:id/comments', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const issueId = req.params.id;
    const { content, attachments = [] } = req.body;

    if (!content) {
      return res.status(400).json({
        error: 'Comment content is required'
      });
    }

    const comment = await issueReportingService.addComment(issueId, userId, content, attachments);

    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    logger.error('Error adding comment:', error);
    res.status(500).json({
      error: 'Failed to add comment',
      details: error.message
    });
  }
});

/**
 * @route GET /api/issues/:id/history
 * @desc Get issue history
 * @access Private
 */
router.get('/:id/history', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const issueId = req.params.id;

    const history = await issueReportingService.getIssueHistory(issueId, userId);

    res.json({
      history
    });
  } catch (error) {
    logger.error('Error getting issue history:', error);
    res.status(500).json({
      error: 'Failed to get issue history',
      details: error.message
    });
  }
});

/**
 * @route GET /api/issues/stats/overview
 * @desc Get issue statistics for the user
 * @access Private
 */
router.get('/stats/overview', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await issueReportingService.getUserIssueStats(userId);
    const issuesByStatus = await issueReportingService.getUserIssuesByStatus(userId);

    res.json({
      stats,
      issuesByStatus
    });
  } catch (error) {
    logger.error('Error getting issue stats:', error);
    res.status(500).json({
      error: 'Failed to get issue statistics',
      details: error.message
    });
  }
});

/**
 * @route GET /api/issues/categories
 * @desc Get all issue categories
 * @access Private
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await issueReportingService.getCategories();

    res.json({
      categories
    });
  } catch (error) {
    logger.error('Error getting categories:', error);
    res.status(500).json({
      error: 'Failed to get categories',
      details: error.message
    });
  }
});

/**
 * @route GET /api/issues/priorities
 * @desc Get all issue priorities
 * @access Private
 */
router.get('/priorities', async (req, res) => {
  try {
    const priorities = await issueReportingService.getPriorities();

    res.json({
      priorities
    });
  } catch (error) {
    logger.error('Error getting priorities:', error);
    res.status(500).json({
      error: 'Failed to get priorities',
      details: error.message
    });
  }
});

/**
 * @route GET /api/issues/statuses
 * @desc Get all issue statuses
 * @access Private
 */
router.get('/statuses', async (req, res) => {
  try {
    const statuses = await issueReportingService.getStatuses();

    res.json({
      statuses
    });
  } catch (error) {
    logger.error('Error getting statuses:', error);
    res.status(500).json({
      error: 'Failed to get statuses',
      details: error.message
    });
  }
});

/**
 * @route GET /api/issues/templates
 * @desc Get all issue templates
 * @access Private
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = await issueReportingService.getTemplates();

    res.json({
      templates
    });
  } catch (error) {
    logger.error('Error getting templates:', error);
    res.status(500).json({
      error: 'Failed to get templates',
      details: error.message
    });
  }
});

/**
 * @route GET /api/issues/outlets
 * @desc Get user's outlets for issue reporting
 * @access Private
 */
router.get('/outlets', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const outlets = await issueReportingService.getUserOutlets(userId);

    res.json({
      outlets
    });
  } catch (error) {
    logger.error('Error getting user outlets:', error);
    res.status(500).json({
      error: 'Failed to get outlets',
      details: error.message
    });
  }
});

/**
 * @route POST /api/issues/:id/attachments
 * @desc Upload attachment for an issue
 * @access Private
 */
router.post('/:id/attachments', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const issueId = req.params.id;

    // Handle file upload (assuming multer middleware is used)
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    const attachment = await issueReportingService.uploadAttachment(issueId, userId, req.file);

    res.status(201).json({
      message: 'Attachment uploaded successfully',
      attachment
    });
  } catch (error) {
    logger.error('Error uploading attachment:', error);
    res.status(500).json({
      error: 'Failed to upload attachment',
      details: error.message
    });
  }
});

export default router;
