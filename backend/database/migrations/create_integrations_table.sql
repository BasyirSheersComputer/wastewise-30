-- Create integrations table for storing external system integration configurations
-- Supports StoreHub and other POS/ERP integrations

CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    integration_type TEXT NOT NULL, -- 'storehub', 'square', 'lightspeed', etc.
    credentials JSONB NOT NULL, -- Encrypted API keys, tokens, etc.
    config JSONB DEFAULT '{}', -- Integration-specific configuration
    status TEXT DEFAULT 'active', -- 'active', 'inactive', 'error'
    last_sync_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one active integration per type per user
    UNIQUE(user_id, integration_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
CREATE INDEX IF NOT EXISTS idx_integrations_user_type ON integrations(user_id, integration_type);

-- Enable RLS
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own integrations" ON integrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations" ON integrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations" ON integrations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations" ON integrations
    FOR DELETE USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_integrations_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_integrations_updated_at();

-- Comments
COMMENT ON TABLE integrations IS 'Stores external system integration configurations (StoreHub, POS systems, etc.)';
COMMENT ON COLUMN integrations.integration_type IS 'Type of integration: storehub, square, lightspeed, etc.';
COMMENT ON COLUMN integrations.credentials IS 'Encrypted API credentials and tokens';
COMMENT ON COLUMN integrations.config IS 'Integration-specific configuration (sync frequency, enabled features, etc.)';

