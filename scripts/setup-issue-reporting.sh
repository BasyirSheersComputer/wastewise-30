#!/bin/bash

# Issue Reporting System Setup Script
# This script sets up the database schema for the issue reporting system

set -e

echo "🚀 Setting up Issue Reporting System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    print_error "Missing required environment variables:"
    print_error "  - VITE_SUPABASE_URL"
    print_error "  - VITE_SUPABASE_ANON_KEY"
    print_error ""
    print_error "Please set these variables in your .env file or environment."
    exit 1
fi

print_status "Environment variables found ✓"

# Check if SQL file exists
SQL_FILE="backend/setup-issue-reporting.sql"
if [ ! -f "$SQL_FILE" ]; then
    print_error "SQL file not found: $SQL_FILE"
    exit 1
fi

print_status "SQL file found: $SQL_FILE ✓"

# Function to apply SQL to Supabase
apply_sql_to_supabase() {
    local sql_file="$1"
    
    print_status "Applying SQL schema to Supabase..."
    
    # Use psql to connect to Supabase (if you have direct database access)
    # This is an alternative approach - you can also use the Supabase dashboard
    
    if command -v psql &> /dev/null; then
        print_status "Using psql to apply schema..."
        
        # Extract database URL from Supabase URL
        DB_URL=$(echo "$VITE_SUPABASE_URL" | sed 's|https://|postgresql://postgres:postgres@|' | sed 's|\.supabase\.co|.supabase.co:5432/postgres|')
        
        if psql "$DB_URL" -f "$sql_file"; then
            print_success "Schema applied successfully via psql"
        else
            print_warning "Failed to apply schema via psql. You may need to apply it manually."
        fi
    else
        print_warning "psql not found. Please apply the SQL manually in the Supabase dashboard."
    fi
}

# Function to verify setup
verify_setup() {
    print_status "Verifying setup..."
    
    # Create a simple test script to verify the tables exist
    cat > /tmp/verify_issue_tables.sql << 'EOF'
-- Verify issue reporting tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('issues', 'issue_categories', 'issue_priorities', 'issue_statuses', 'issue_comments', 'issue_history', 'issue_templates') 
        THEN '✓' 
        ELSE '✗' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('issues', 'issue_categories', 'issue_priorities', 'issue_statuses', 'issue_comments', 'issue_history', 'issue_templates')
ORDER BY table_name;
EOF

    if command -v psql &> /dev/null; then
        DB_URL=$(echo "$VITE_SUPABASE_URL" | sed 's|https://|postgresql://postgres:postgres@|' | sed 's|\.supabase\.co|.supabase.co:5432/postgres|')
        
        print_status "Verifying tables..."
        psql "$DB_URL" -f /tmp/verify_issue_tables.sql
        
        rm /tmp/verify_issue_tables.sql
    else
        print_warning "Cannot verify automatically. Please check manually in Supabase dashboard."
    fi
}

# Main execution
main() {
    print_status "Starting Issue Reporting System setup..."
    
    # Apply SQL schema
    apply_sql_to_supabase "$SQL_FILE"
    
    # Verify setup
    verify_setup
    
    print_success "Issue Reporting System setup completed!"
    print_status ""
    print_status "Next steps:"
    print_status "1. Verify tables were created in Supabase dashboard"
    print_status "2. Test the issue reporting functionality in your application"
    print_status "3. Configure any additional settings as needed"
    print_status ""
    print_status "Manual setup instructions (if automatic failed):"
    print_status "1. Go to your Supabase dashboard"
    print_status "2. Navigate to SQL Editor"
    print_status "3. Copy and paste the contents of: $SQL_FILE"
    print_status "4. Execute the SQL"
    print_status ""
}

# Run main function
main "$@"
