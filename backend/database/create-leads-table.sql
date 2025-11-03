-- ================================================
-- Leads Table Creation Script
-- ================================================
-- Purpose: Store lead capture form submissions
-- Version: 1.0.0
-- Date: November 3, 2025
-- ================================================

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  message TEXT,
  source TEXT DEFAULT 'website',
  interest TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Additional metadata
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ================================================
-- INDEXES
-- ================================================

-- Email lookup
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Created at (for sorting)
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- Source tracking
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

-- Interest filtering
CREATE INDEX IF NOT EXISTS idx_leads_interest ON leads(interest);

-- Composite index for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON leads(status, created_at DESC);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous lead submissions (from website forms)
CREATE POLICY "Allow anonymous lead submissions" ON leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users (admins) to view all leads
CREATE POLICY "Allow authenticated users to view all leads" ON leads
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users (admins) to update leads
CREATE POLICY "Allow authenticated users to update leads" ON leads
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users (admins) to delete leads
CREATE POLICY "Allow authenticated users to delete leads" ON leads
  FOR DELETE
  TO authenticated
  USING (true);

-- ================================================
-- TRIGGERS
-- ================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_timestamp
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();

-- ================================================
-- SAMPLE DATA (Optional - for testing)
-- ================================================

-- Uncomment to insert sample leads for testing
/*
INSERT INTO leads (name, email, phone, company, message, source, interest, status) VALUES
  ('Alice Johnson', 'alice@coffeeshop.com', '+60123456789', 'Alice Coffee House', 'Interested in waste reduction', 'website', 'waste_audit', 'new'),
  ('Bob Smith', 'bob@restaurants.com', '+60198765432', 'Bob''s Restaurant Chain', 'Want to reduce food waste', 'landing_page', 'cost_savings', 'contacted'),
  ('Carol Lee', 'carol@foodservice.my', '+60112345678', 'Carol''s F&B Group', 'Need analytics dashboard', 'referral', 'analytics', 'qualified');
*/

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Count total leads
-- SELECT COUNT(*) as total_leads FROM leads;

-- View recent leads
-- SELECT id, name, email, company, source, status, created_at 
-- FROM leads 
-- ORDER BY created_at DESC 
-- LIMIT 10;

-- Leads by status
-- SELECT status, COUNT(*) as count 
-- FROM leads 
-- GROUP BY status 
-- ORDER BY count DESC;

-- Leads by source
-- SELECT source, COUNT(*) as count 
-- FROM leads 
-- GROUP BY source 
-- ORDER BY count DESC;

-- ================================================
-- DONE!
-- ================================================

SELECT 'Leads table created successfully!' as message;

