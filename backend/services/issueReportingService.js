import { createClient } from '@supabase/supabase-js';
import logger from '../utils/logger.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

class IssueReportingService {
  constructor() {
    this.supabase = supabase;
  }

  /**
   * Create a new issue
   */
  async createIssue(userId, issueData) {
    try {
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
      } = issueData;

      // Validate required fields
      if (!title || !description) {
        throw new Error('Title and description are required');
      }

      // Get default status (open)
      const { data: defaultStatus } = await this.supabase
        .from('issue_statuses')
        .select('id')
        .eq('name', 'open')
        .single();

      if (!defaultStatus) {
        throw new Error('Default issue status not found');
      }

      // Create the issue
      const { data: issue, error } = await this.supabase
        .from('issues')
        .insert([{
          user_id: userId,
          title,
          description,
          category_id: categoryId,
          priority_id: priorityId,
          status_id: defaultStatus.id,
          outlet_id: outletId,
          attachments,
          browser_info: browserInfo,
          device_info: deviceInfo,
          page_url: pageUrl,
          user_agent: userAgent,
          screen_resolution: screenResolution
        }])
        .select(`
          *,
          category:issue_categories(name, description, icon, color),
          priority:issue_priorities(name, description, color, sla_hours),
          status:issue_statuses(name, description, color, is_final),
          outlet:outlets(outlet_name, address)
        `)
        .single();

      if (error) throw error;

      // Add to history
      await this.addIssueHistory(issue.id, userId, 'created', null, null, 'created');

      logger.info(`Issue created: ${issue.id} by user ${userId}`);
      return issue;
    } catch (error) {
      logger.error('Error creating issue:', error);
      throw error;
    }
  }

  /**
   * Get all issues for a user
   */
  async getUserIssues(userId, filters = {}) {
    try {
      let query = this.supabase
        .from('issues')
        .select(`
          *,
          category:issue_categories(name, description, icon, color),
          priority:issue_priorities(name, description, color, sla_hours),
          status:issue_statuses(name, description, color, is_final),
          outlet:outlets(outlet_name, address),
          comments:issue_comments(count)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status:issue_statuses.name', filters.status);
      }
      if (filters.category) {
        query = query.eq('category:issue_categories.name', filters.category);
      }
      if (filters.priority) {
        query = query.eq('priority:issue_priorities.name', filters.priority);
      }
      if (filters.outletId) {
        query = query.eq('outlet_id', filters.outletId);
      }

      const { data: issues, error } = await query;

      if (error) throw error;
      return issues;
    } catch (error) {
      logger.error('Error getting user issues:', error);
      throw error;
    }
  }

  /**
   * Get a specific issue with comments
   */
  async getIssue(issueId, userId) {
    try {
      const { data: issue, error } = await this.supabase
        .from('issues')
        .select(`
          *,
          category:issue_categories(name, description, icon, color),
          priority:issue_priorities(name, description, color, sla_hours),
          status:issue_statuses(name, description, color, is_final),
          outlet:outlets(outlet_name, address)
        `)
        .eq('id', issueId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      // Get comments
      const { data: comments, error: commentsError } = await this.supabase
        .from('issue_comments')
        .select(`
          *,
          user:users(first_name, last_name, email)
        `)
        .eq('issue_id', issueId)
        .eq('is_internal', false)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      return {
        ...issue,
        comments
      };
    } catch (error) {
      logger.error('Error getting issue:', error);
      throw error;
    }
  }

  /**
   * Update an issue
   */
  async updateIssue(issueId, userId, updateData) {
    try {
      const { data: issue, error } = await this.supabase
        .from('issues')
        .update(updateData)
        .eq('id', issueId)
        .eq('user_id', userId)
        .select(`
          *,
          category:issue_categories(name, description, icon, color),
          priority:issue_priorities(name, description, color, sla_hours),
          status:issue_statuses(name, description, color, is_final),
          outlet:outlets(outlet_name, address)
        `)
        .single();

      if (error) throw error;

      logger.info(`Issue updated: ${issueId} by user ${userId}`);
      return issue;
    } catch (error) {
      logger.error('Error updating issue:', error);
      throw error;
    }
  }

  /**
   * Add a comment to an issue
   */
  async addComment(issueId, userId, content, attachments = []) {
    try {
      const { data: comment, error } = await this.supabase
        .from('issue_comments')
        .insert([{
          issue_id: issueId,
          user_id: userId,
          content,
          attachments
        }])
        .select(`
          *,
          user:users(first_name, last_name, email)
        `)
        .single();

      if (error) throw error;

      logger.info(`Comment added to issue ${issueId} by user ${userId}`);
      return comment;
    } catch (error) {
      logger.error('Error adding comment:', error);
      throw error;
    }
  }

  /**
   * Get issue statistics for a user
   */
  async getUserIssueStats(userId) {
    try {
      const { data, error } = await this.supabase
        .rpc('get_user_issue_stats', { user_uuid: userId });

      if (error) throw error;
      return data[0] || {
        total_issues: 0,
        open_issues: 0,
        resolved_issues: 0,
        avg_resolution_time_hours: 0
      };
    } catch (error) {
      logger.error('Error getting user issue stats:', error);
      throw error;
    }
  }

  /**
   * Get issues by status for a user
   */
  async getUserIssuesByStatus(userId) {
    try {
      const { data, error } = await this.supabase
        .rpc('get_user_issues_by_status', { user_uuid: userId });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting user issues by status:', error);
      throw error;
    }
  }

  /**
   * Get issue categories
   */
  async getCategories() {
    try {
      const { data, error } = await this.supabase
        .from('issue_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting categories:', error);
      throw error;
    }
  }

  /**
   * Get issue priorities
   */
  async getPriorities() {
    try {
      const { data, error } = await this.supabase
        .from('issue_priorities')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting priorities:', error);
      throw error;
    }
  }

  /**
   * Get issue statuses
   */
  async getStatuses() {
    try {
      const { data, error } = await this.supabase
        .from('issue_statuses')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting statuses:', error);
      throw error;
    }
  }

  /**
   * Get issue templates
   */
  async getTemplates() {
    try {
      const { data, error } = await this.supabase
        .from('issue_templates')
        .select(`
          *,
          category:issue_categories(name, description, icon, color),
          priority:issue_priorities(name, description, color)
        `)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting templates:', error);
      throw error;
    }
  }

  /**
   * Get user's outlets for issue reporting
   */
  async getUserOutlets(userId) {
    try {
      const { data, error } = await this.supabase
        .from('outlets')
        .select('id, outlet_name, address, city, state')
        .eq('chain_id', 
          this.supabase
            .from('coffee_chains')
            .select('id')
            .eq('user_id', userId)
            .single()
        )
        .order('outlet_name', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting user outlets:', error);
      throw error;
    }
  }

  /**
   * Add issue history entry
   */
  async addIssueHistory(issueId, userId, fieldName, oldValue, newValue, changeType) {
    try {
      const { error } = await this.supabase
        .from('issue_history')
        .insert([{
          issue_id: issueId,
          user_id: userId,
          field_name: fieldName,
          old_value: oldValue,
          new_value: newValue,
          change_type: changeType
        }]);

      if (error) throw error;
    } catch (error) {
      logger.error('Error adding issue history:', error);
      // Don't throw here as this is not critical
    }
  }

  /**
   * Get issue history
   */
  async getIssueHistory(issueId, userId) {
    try {
      const { data, error } = await this.supabase
        .from('issue_history')
        .select(`
          *,
          user:users(first_name, last_name, email)
        `)
        .eq('issue_id', issueId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting issue history:', error);
      throw error;
    }
  }

  /**
   * Delete an issue (only if it's open and user owns it)
   */
  async deleteIssue(issueId, userId) {
    try {
      // Check if issue exists and user owns it
      const { data: issue, error: checkError } = await this.supabase
        .from('issues')
        .select('status_id, status:issue_statuses(name)')
        .eq('id', issueId)
        .eq('user_id', userId)
        .single();

      if (checkError) throw checkError;

      // Only allow deletion of open issues
      if (issue.status.name !== 'open') {
        throw new Error('Only open issues can be deleted');
      }

      const { error } = await this.supabase
        .from('issues')
        .delete()
        .eq('id', issueId)
        .eq('user_id', userId);

      if (error) throw error;

      logger.info(`Issue deleted: ${issueId} by user ${userId}`);
      return { success: true };
    } catch (error) {
      logger.error('Error deleting issue:', error);
      throw error;
    }
  }

  /**
   * Upload attachment for an issue
   */
  async uploadAttachment(issueId, userId, file) {
    try {
      const fileName = `${issueId}/${Date.now()}-${file.name}`;
      const filePath = `issue-attachments/${fileName}`;

      const { error } = await this.supabase.storage
        .from('issue-attachments')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from('issue-attachments')
        .getPublicUrl(filePath);

      return {
        fileName: file.name,
        filePath,
        publicUrl,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      logger.error('Error uploading attachment:', error);
      throw error;
    }
  }
}

export default new IssueReportingService();
