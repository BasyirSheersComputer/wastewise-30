-- FAQ and Chat System Database Schema
-- Supports keyword-based FAQ queries and chat interactions

-- FAQ Categories
CREATE TABLE IF NOT EXISTS faq_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ Articles
CREATE TABLE IF NOT EXISTS faq_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES faq_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    keywords TEXT[], -- Array of keywords for matching
    tags TEXT[], -- Additional tags
    priority INTEGER DEFAULT 0, -- Higher priority = more relevant
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ Keywords (for better matching)
CREATE TABLE IF NOT EXISTS faq_keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES faq_articles(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    weight DECIMAL(3,2) DEFAULT 1.0, -- Weight for relevance scoring
    is_synonym BOOLEAN DEFAULT false, -- Whether this is a synonym
    synonym_of TEXT, -- Original keyword if this is a synonym
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, keyword)
);

-- Chat Sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_key TEXT UNIQUE NOT NULL, -- For anonymous sessions
    status TEXT DEFAULT 'active', -- 'active', 'escalated', 'resolved', 'closed'
    escalated_to TEXT, -- Customer rep ID or contact method
    escalated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    sender TEXT NOT NULL, -- 'user' or 'bot'
    message_type TEXT DEFAULT 'text', -- 'text', 'faq_response', 'escalation', 'system'
    faq_article_id UUID REFERENCES faq_articles(id) ON DELETE SET NULL,
    suggested_articles UUID[], -- Array of related FAQ IDs
    is_satisfied BOOLEAN, -- User satisfaction feedback
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Escalation Requests
CREATE TABLE IF NOT EXISTS chat_escalations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT,
    priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    status TEXT DEFAULT 'pending', -- 'pending', 'assigned', 'resolved', 'closed'
    assigned_to TEXT, -- Customer rep ID
    resolved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_faq_articles_category ON faq_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_faq_articles_keywords ON faq_articles USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_faq_articles_tags ON faq_articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_faq_articles_active ON faq_articles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_faq_keywords_keyword ON faq_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_faq_keywords_article ON faq_keywords(article_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_escalations_session ON chat_escalations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_escalations_status ON chat_escalations(status);

-- Enable RLS
ALTER TABLE faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_escalations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for FAQ (public read, admin write)
CREATE POLICY "Anyone can view FAQ categories" ON faq_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view FAQ articles" ON faq_articles
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view FAQ keywords" ON faq_keywords
    FOR SELECT USING (true);

-- RLS Policies for Chat Sessions
CREATE POLICY "Users can view own chat sessions" ON chat_sessions
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create own chat sessions" ON chat_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own chat sessions" ON chat_sessions
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for Chat Messages
CREATE POLICY "Users can view own chat messages" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_sessions 
            WHERE chat_sessions.id = chat_messages.session_id 
            AND (chat_sessions.user_id = auth.uid() OR chat_sessions.user_id IS NULL)
        )
    );

CREATE POLICY "Users can insert own chat messages" ON chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_sessions 
            WHERE chat_sessions.id = chat_messages.session_id 
            AND (chat_sessions.user_id = auth.uid() OR chat_sessions.user_id IS NULL)
        )
    );

-- RLS Policies for Escalations
CREATE POLICY "Users can view own escalations" ON chat_escalations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own escalations" ON chat_escalations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_faq_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_faq_categories_updated_at
    BEFORE UPDATE ON faq_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_faq_updated_at();

CREATE TRIGGER update_faq_articles_updated_at
    BEFORE UPDATE ON faq_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_faq_updated_at();

CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_faq_updated_at();

CREATE TRIGGER update_chat_escalations_updated_at
    BEFORE UPDATE ON chat_escalations
    FOR EACH ROW
    EXECUTE FUNCTION update_faq_updated_at();

-- Comments
COMMENT ON TABLE faq_categories IS 'Categories for organizing FAQ articles';
COMMENT ON TABLE faq_articles IS 'FAQ articles with content and keywords';
COMMENT ON TABLE faq_keywords IS 'Keywords and synonyms for FAQ matching';
COMMENT ON TABLE chat_sessions IS 'Chat sessions between users and bot';
COMMENT ON TABLE chat_messages IS 'Individual messages in chat sessions';
COMMENT ON TABLE chat_escalations IS 'Requests to escalate chat to customer rep';

