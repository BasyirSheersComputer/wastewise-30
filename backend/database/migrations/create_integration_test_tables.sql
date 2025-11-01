-- Create tables for integration testing and data storage
-- Supports POS, ERP, CRM, and WFM integration data

-- Integration sync logs table
CREATE TABLE IF NOT EXISTS integration_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    integration_type TEXT NOT NULL,
    data_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'success', 'failed'
    records_synced INTEGER DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for sync logs
CREATE INDEX IF NOT EXISTS idx_sync_logs_user_id ON integration_sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_integration_type ON integration_sync_logs(integration_type);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON integration_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON integration_sync_logs(created_at DESC);

-- Ensure inventory_data table exists (if not already present)
CREATE TABLE IF NOT EXISTS inventory_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    sku TEXT,
    category TEXT,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit TEXT DEFAULT 'pieces',
    cost_per_unit DECIMAL(10,2),
    reorder_point DECIMAL(10,2),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, sku)
);

-- Indexes for inventory_data
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory_data(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_outlet_id ON inventory_data(outlet_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory_data(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_data(category);

-- Integration test results table
CREATE TABLE IF NOT EXISTS integration_test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    integration_type TEXT NOT NULL,
    test_type TEXT NOT NULL, -- 'connection', 'data_sync', 'webhook', 'full'
    status TEXT NOT NULL, -- 'passed', 'failed', 'partial'
    test_details JSONB,
    duration_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for test results
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON integration_test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_integration_type ON integration_test_results(integration_type);
CREATE INDEX IF NOT EXISTS idx_test_results_status ON integration_test_results(status);
CREATE INDEX IF NOT EXISTS idx_test_results_created_at ON integration_test_results(created_at DESC);

-- Staff schedules table (if not exists)
CREATE TABLE IF NOT EXISTS staff_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
    staff_id TEXT NOT NULL,
    staff_name TEXT,
    schedule_date DATE NOT NULL,
    shift_type TEXT, -- 'morning', 'afternoon', 'evening', 'full'
    start_time TIME,
    end_time TIME,
    break_duration INTEGER DEFAULT 30, -- minutes
    position TEXT,
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, staff_id, schedule_date, start_time)
);

-- Indexes for staff_schedules
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON staff_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_outlet_id ON staff_schedules(outlet_id);
CREATE INDEX IF NOT EXISTS idx_schedules_staff_id ON staff_schedules(staff_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON staff_schedules(schedule_date);

-- Staff attendance table
CREATE TABLE IF NOT EXISTS staff_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    outlet_id UUID REFERENCES outlets(id) ON DELETE SET NULL,
    staff_id TEXT NOT NULL,
    staff_name TEXT,
    attendance_date DATE NOT NULL,
    shift_type TEXT,
    scheduled_start TIME,
    scheduled_end TIME,
    clock_in TIMESTAMP WITH TIME ZONE,
    clock_out TIMESTAMP WITH TIME ZONE,
    hours_worked DECIMAL(5,2),
    status TEXT DEFAULT 'present', -- 'present', 'late', 'absent', 'early_leave'
    late_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, staff_id, attendance_date)
);

-- Indexes for staff_attendance
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON staff_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_outlet_id ON staff_attendance(outlet_id);
CREATE INDEX IF NOT EXISTS idx_attendance_staff_id ON staff_attendance(staff_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON staff_attendance(attendance_date);

-- Enable RLS
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for integration_sync_logs
CREATE POLICY "Users can view own sync logs" ON integration_sync_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync logs" ON integration_sync_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for inventory_data
CREATE POLICY "Users can view own inventory" ON inventory_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory" ON inventory_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory" ON inventory_data
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for integration_test_results
CREATE POLICY "Users can view own test results" ON integration_test_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own test results" ON integration_test_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for staff_schedules
CREATE POLICY "Users can view own schedules" ON staff_schedules
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedules" ON staff_schedules
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedules" ON staff_schedules
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for staff_attendance
CREATE POLICY "Users can view own attendance" ON staff_attendance
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attendance" ON staff_attendance
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attendance" ON staff_attendance
    FOR UPDATE USING (auth.uid() = user_id);

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON inventory_data
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_updated_at();

CREATE OR REPLACE FUNCTION update_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON staff_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_schedules_updated_at();

CREATE OR REPLACE FUNCTION update_attendance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_attendance_updated_at
    BEFORE UPDATE ON staff_attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_attendance_updated_at();

-- Comments
COMMENT ON TABLE integration_sync_logs IS 'Logs of data synchronization from external integrations';
COMMENT ON TABLE inventory_data IS 'Inventory levels synced from POS/ERP systems';
COMMENT ON TABLE integration_test_results IS 'Results of integration connection and data sync tests';
COMMENT ON TABLE staff_schedules IS 'Staff schedules synced from WFM systems like Lark';
COMMENT ON TABLE staff_attendance IS 'Staff attendance records synced from WFM systems';

