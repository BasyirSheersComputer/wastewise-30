-- Issue Reporting System Database Setup
-- This script creates the necessary tables and functions for the issue reporting system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ISSUE REPORTING TABLES
-- =====================================================

-- Issue categories table
CREATE TABLE IF NOT EXISTS issue_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Issue priorities table
CREATE TABLE IF NOT EXISTS issue_priorities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    sla_hours INTEGER, -- Service Level Agreement in hours
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Issue statuses table
CREATE TABLE IF NOT EXISTS issue_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT NOT NULL,
    is_final BOOLEAN DEFAULT false, -- Whether this is a final status (closed, resolved, etc.)
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Main issues table
CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
    
    -- Issue details
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES issue_categories(id),
    priority_id UUID REFERENCES issue_priorities(id),
    status_id UUID REFERENCES issue_statuses(id),
    
    -- Additional metadata
    browser_info JSONB,
    device_info JSONB,
    page_url TEXT,
    user_agent TEXT,
    screen_resolution TEXT,
    
    -- File attachments (stored as JSON array of file paths)
    attachments JSONB DEFAULT '[]',
    
    -- Internal fields
    internal_notes TEXT,
    assigned_to UUID REFERENCES auth.users(id),
    estimated_resolution_date TIMESTAMP WITH TIME ZONE,
    actual_resolution_date TIMESTAMP WITH TIME ZONE,
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Issue comments/updates table
CREATE TABLE IF NOT EXISTS issue_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Comment content
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false, -- Internal comments not visible to users
    is_status_update BOOLEAN DEFAULT false, -- Whether this comment represents a status change
    
    -- Attachments
    attachments JSONB DEFAULT '[]',
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Issue history table (for audit trail)
CREATE TABLE IF NOT EXISTS issue_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Change details
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_type TEXT CHECK (change_type IN ('created', 'updated', 'deleted', 'status_change', 'priority_change', 'assignment_change')),
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Issue templates table (for common issue types)
CREATE TABLE IF NOT EXISTS issue_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES issue_categories(id),
    priority_id UUID REFERENCES issue_priorities(id),
    template_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Issues indexes
CREATE INDEX IF NOT EXISTS idx_issues_user_id ON issues(user_id);
CREATE INDEX IF NOT EXISTS idx_issues_outlet_id ON issues(outlet_id);
CREATE INDEX IF NOT EXISTS idx_issues_category_id ON issues(category_id);
CREATE INDEX IF NOT EXISTS idx_issues_priority_id ON issues(priority_id);
CREATE INDEX IF NOT EXISTS idx_issues_status_id ON issues(status_id);
CREATE INDEX IF NOT EXISTS idx_issues_assigned_to ON issues(assigned_to);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at);
CREATE INDEX IF NOT EXISTS idx_issues_status_created ON issues(status_id, created_at);
CREATE INDEX IF NOT EXISTS idx_issues_priority_created ON issues(priority_id, created_at);

-- Issue comments indexes
CREATE INDEX IF NOT EXISTS idx_issue_comments_issue_id ON issue_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_user_id ON issue_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_created_at ON issue_comments(created_at);

-- Issue history indexes
CREATE INDEX IF NOT EXISTS idx_issue_history_issue_id ON issue_history(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_history_user_id ON issue_history(user_id);
CREATE INDEX IF NOT EXISTS idx_issue_history_created_at ON issue_history(created_at);

-- Categories, priorities, statuses indexes
CREATE INDEX IF NOT EXISTS idx_issue_categories_active ON issue_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_issue_priorities_sort ON issue_priorities(sort_order);
CREATE INDEX IF NOT EXISTS idx_issue_statuses_sort ON issue_statuses(sort_order);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT AND HISTORY
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_issue_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to track issue changes in history
CREATE OR REPLACE FUNCTION track_issue_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Track status changes
    IF OLD.status_id IS DISTINCT FROM NEW.status_id THEN
        INSERT INTO issue_history (issue_id, user_id, field_name, old_value, new_value, change_type)
        VALUES (
            NEW.id,
            COALESCE(NEW.assigned_to, auth.uid()),
            'status',
            (SELECT name FROM issue_statuses WHERE id = OLD.status_id),
            (SELECT name FROM issue_statuses WHERE id = NEW.status_id),
            'status_change'
        );
        
        -- Update resolved_at if status is resolved
        IF NEW.status_id IN (SELECT id FROM issue_statuses WHERE name IN ('resolved', 'closed')) THEN
            NEW.resolved_at = NOW();
        END IF;
    END IF;
    
    -- Track priority changes
    IF OLD.priority_id IS DISTINCT FROM NEW.priority_id THEN
        INSERT INTO issue_history (issue_id, user_id, field_name, old_value, new_value, change_type)
        VALUES (
            NEW.id,
            COALESCE(NEW.assigned_to, auth.uid()),
            'priority',
            (SELECT name FROM issue_priorities WHERE id = OLD.priority_id),
            (SELECT name FROM issue_priorities WHERE id = NEW.priority_id),
            'priority_change'
        );
    END IF;
    
    -- Track assignment changes
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
        INSERT INTO issue_history (issue_id, user_id, field_name, old_value, new_value, change_type)
        VALUES (
            NEW.id,
            COALESCE(NEW.assigned_to, auth.uid()),
            'assigned_to',
            OLD.assigned_to::text,
            NEW.assigned_to::text,
            'assignment_change'
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues FOR EACH ROW EXECUTE FUNCTION update_issue_updated_at_column();
CREATE TRIGGER update_issue_categories_updated_at BEFORE UPDATE ON issue_categories FOR EACH ROW EXECUTE FUNCTION update_issue_updated_at_column();
CREATE TRIGGER update_issue_priorities_updated_at BEFORE UPDATE ON issue_priorities FOR EACH ROW EXECUTE FUNCTION update_issue_updated_at_column();
CREATE TRIGGER update_issue_statuses_updated_at BEFORE UPDATE ON issue_statuses FOR EACH ROW EXECUTE FUNCTION update_issue_updated_at_column();
CREATE TRIGGER update_issue_templates_updated_at BEFORE UPDATE ON issue_templates FOR EACH ROW EXECUTE FUNCTION update_issue_updated_at_column();
CREATE TRIGGER update_issue_comments_updated_at BEFORE UPDATE ON issue_comments FOR EACH ROW EXECUTE FUNCTION update_issue_updated_at_column();

-- Create trigger for issue change tracking
CREATE TRIGGER track_issue_changes_trigger BEFORE UPDATE ON issues FOR EACH ROW EXECUTE FUNCTION track_issue_changes();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all issue reporting tables
ALTER TABLE issue_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_templates ENABLE ROW LEVEL SECURITY;

-- Issue categories policies (read-only for all authenticated users)
CREATE POLICY "Users can view active issue categories" ON issue_categories FOR SELECT USING (is_active = true);

-- Issue priorities policies (read-only for all authenticated users)
CREATE POLICY "Users can view issue priorities" ON issue_priorities FOR SELECT USING (true);

-- Issue statuses policies (read-only for all authenticated users)
CREATE POLICY "Users can view issue statuses" ON issue_statuses FOR SELECT USING (true);

-- Issues policies
CREATE POLICY "Users can view own issues" ON issues FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own issues" ON issues FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own issues" ON issues FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own issues" ON issues FOR DELETE USING (auth.uid() = user_id);

-- Issue comments policies
CREATE POLICY "Users can view comments on own issues" ON issue_comments FOR SELECT USING (
    EXISTS (SELECT 1 FROM issues WHERE issues.id = issue_comments.issue_id AND issues.user_id = auth.uid())
);
CREATE POLICY "Users can create comments on own issues" ON issue_comments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM issues WHERE issues.id = issue_comments.issue_id AND issues.user_id = auth.uid())
);
CREATE POLICY "Users can update own comments" ON issue_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON issue_comments FOR DELETE USING (auth.uid() = user_id);

-- Issue history policies
CREATE POLICY "Users can view history of own issues" ON issue_history FOR SELECT USING (
    EXISTS (SELECT 1 FROM issues WHERE issues.id = issue_history.issue_id AND issues.user_id = auth.uid())
);

-- Issue templates policies (read-only for all authenticated users)
CREATE POLICY "Users can view active issue templates" ON issue_templates FOR SELECT USING (is_active = true);

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Insert default issue categories
INSERT INTO issue_categories (name, description, icon, color, sort_order) VALUES
('bug', 'Software bugs and technical issues', 'bug', '#EF4444', 1),
('feature_request', 'New feature requests and enhancements', 'lightbulb', '#10B981', 2),
('ui_ux', 'User interface and experience issues', 'layout', '#3B82F6', 3),
('performance', 'Performance and speed issues', 'zap', '#F59E0B', 4),
('data', 'Data accuracy and synchronization issues', 'database', '#8B5CF6', 5),
('integration', 'Third-party integration issues', 'link', '#06B6D4', 6),
('billing', 'Billing and subscription issues', 'credit-card', '#EC4899', 7),
('general', 'General questions and support', 'help-circle', '#6B7280', 8)
ON CONFLICT (name) DO NOTHING;

-- Insert default issue priorities
INSERT INTO issue_priorities (name, description, color, sort_order, sla_hours) VALUES
('critical', 'Critical issues affecting core functionality', '#EF4444', 1, 4),
('high', 'High priority issues affecting user experience', '#F59E0B', 2, 24),
('medium', 'Medium priority issues with workarounds', '#3B82F6', 3, 72),
('low', 'Low priority issues and minor improvements', '#10B981', 4, 168)
ON CONFLICT (name) DO NOTHING;

-- Insert default issue statuses
INSERT INTO issue_statuses (name, description, color, is_final, sort_order) VALUES
('open', 'Issue has been reported and is awaiting review', '#3B82F6', false, 1),
('in_progress', 'Issue is being worked on', '#F59E0B', false, 2),
('waiting_for_user', 'Waiting for user response or additional information', '#8B5CF6', false, 3),
('resolved', 'Issue has been resolved and is ready for testing', '#10B981', false, 4),
('closed', 'Issue has been closed and verified', '#6B7280', true, 5),
('duplicate', 'Issue is a duplicate of another issue', '#EF4444', true, 6),
('wont_fix', 'Issue will not be fixed', '#6B7280', true, 7)
ON CONFLICT (name) DO NOTHING;

-- Insert default issue templates
INSERT INTO issue_templates (name, description, category_id, priority_id, template_content) VALUES
('Bug Report', 'Standard bug report template', 
 (SELECT id FROM issue_categories WHERE name = 'bug'),
 (SELECT id FROM issue_priorities WHERE name = 'medium'),
 '**Description:**
Please provide a clear and concise description of the bug.

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. See error...

**Expected Behavior:**
What should happen?

**Actual Behavior:**
What actually happens?

**Environment:**
- Browser: [e.g., Chrome, Firefox, Safari]
- Version: [e.g., 22]
- Operating System: [e.g., Windows, macOS, Linux]

**Additional Information:**
Any other context about the problem here.'),

('Feature Request', 'Standard feature request template',
 (SELECT id FROM issue_categories WHERE name = 'feature_request'),
 (SELECT id FROM issue_priorities WHERE name = 'low'),
 '**Feature Description:**
Please provide a clear and concise description of the feature you would like to see.

**Use Case:**
Describe the specific use case or scenario where this feature would be helpful.

**Proposed Solution:**
If you have any ideas on how this feature could be implemented, please share them.

**Alternative Solutions:**
Are there any existing features or workarounds that could address this need?

**Additional Information:**
Any other context or screenshots about the feature request here.'),

('Performance Issue', 'Performance problem template',
 (SELECT id FROM issue_categories WHERE name = 'performance'),
 (SELECT id FROM issue_priorities WHERE name = 'high'),
 '**Performance Issue:**
Please describe the performance problem you are experiencing.

**When Does This Occur:**
- Time of day?
- Specific actions?
- Frequency?

**Expected Performance:**
What performance level do you expect?

**Current Performance:**
What performance level are you experiencing?

**Environment:**
- Device type: [e.g., Desktop, Mobile, Tablet]
- Connection speed: [e.g., Fast, Slow, Mobile data]
- Browser: [e.g., Chrome, Firefox, Safari]

**Additional Information:**
Any other context about the performance issue here.')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get issue statistics for a user
CREATE OR REPLACE FUNCTION get_user_issue_stats(user_uuid UUID)
RETURNS TABLE (
    total_issues INTEGER,
    open_issues INTEGER,
    resolved_issues INTEGER,
    avg_resolution_time_hours NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_issues,
        COUNT(*) FILTER (WHERE status_id IN (SELECT id FROM issue_statuses WHERE name IN ('open', 'in_progress', 'waiting_for_user')))::INTEGER as open_issues,
        COUNT(*) FILTER (WHERE status_id IN (SELECT id FROM issue_statuses WHERE name IN ('resolved', 'closed')))::INTEGER as resolved_issues,
        AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600)::NUMERIC as avg_resolution_time_hours
    FROM issues 
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get issues by status for a user
CREATE OR REPLACE FUNCTION get_user_issues_by_status(user_uuid UUID)
RETURNS TABLE (
    status_name TEXT,
    issue_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.name as status_name,
        COUNT(i.id)::INTEGER as issue_count
    FROM issue_statuses s
    LEFT JOIN issues i ON s.id = i.status_id AND i.user_id = user_uuid
    GROUP BY s.id, s.name, s.sort_order
    ORDER BY s.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
