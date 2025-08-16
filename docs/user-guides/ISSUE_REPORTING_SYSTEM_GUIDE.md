# Issue Reporting System Guide

## Overview

The Issue Reporting System is a comprehensive solution that allows users to report bugs, request features, and get support within the WasteWise SaaS platform. It provides a complete workflow from issue creation to resolution with full tracking and communication capabilities.

## Features

### Core Functionality
- **Issue Creation**: Users can create detailed issue reports with categories, priorities, and attachments
- **Issue Tracking**: Full lifecycle tracking from creation to resolution
- **Comments & Communication**: Threaded discussions on each issue
- **File Attachments**: Support for uploading screenshots, logs, and other files
- **Status Management**: Multiple statuses (Open, In Progress, Waiting for User, Resolved, Closed, etc.)
- **Priority Levels**: Critical, High, Medium, Low with SLA tracking
- **Categories**: Bug, Feature Request, UI/UX, Performance, Data, Integration, Billing, General
- **Templates**: Pre-built templates for common issue types
- **Statistics**: Dashboard with issue metrics and resolution times
- **Filtering & Search**: Advanced filtering by status, category, priority, and outlet

### Technical Features
- **Row Level Security**: Users can only see their own issues
- **Audit Trail**: Complete history of all changes
- **Real-time Updates**: Live status updates and notifications
- **Mobile Responsive**: Works on all devices
- **API Integration**: Full REST API for programmatic access

## Database Schema

### Core Tables

#### `issues`
Main table storing issue information:
- `id`: Unique identifier
- `user_id`: Owner of the issue
- `outlet_id`: Associated outlet (optional)
- `title`: Issue title
- `description`: Detailed description
- `category_id`: Issue category
- `priority_id`: Priority level
- `status_id`: Current status
- `attachments`: JSON array of file paths
- `browser_info`: Browser metadata
- `device_info`: Device information
- `page_url`: Page where issue occurred
- `user_agent`: Browser user agent
- `screen_resolution`: Screen resolution
- `internal_notes`: Internal notes (admin only)
- `assigned_to`: Assigned user (future feature)
- `estimated_resolution_date`: Estimated fix date
- `actual_resolution_date`: Actual fix date
- `created_at`, `updated_at`: Timestamps
- `resolved_at`, `closed_at`: Resolution timestamps

#### `issue_categories`
Predefined issue categories:
- `id`: Unique identifier
- `name`: Category name (bug, feature_request, etc.)
- `description`: Human-readable description
- `icon`: Icon identifier
- `color`: Display color
- `is_active`: Whether category is active
- `sort_order`: Display order

#### `issue_priorities`
Priority levels with SLA:
- `id`: Unique identifier
- `name`: Priority name (critical, high, medium, low)
- `description`: Human-readable description
- `color`: Display color
- `sort_order`: Display order
- `sla_hours`: Service Level Agreement in hours

#### `issue_statuses`
Issue status definitions:
- `id`: Unique identifier
- `name`: Status name (open, in_progress, etc.)
- `description`: Human-readable description
- `color`: Display color
- `is_final`: Whether this is a final status
- `sort_order`: Display order

#### `issue_comments`
Comments and updates on issues:
- `id`: Unique identifier
- `issue_id`: Associated issue
- `user_id`: Comment author
- `content`: Comment text
- `is_internal`: Internal comment flag
- `is_status_update`: Status change flag
- `attachments`: JSON array of file paths
- `created_at`, `updated_at`: Timestamps

#### `issue_history`
Audit trail for all changes:
- `id`: Unique identifier
- `issue_id`: Associated issue
- `user_id`: User who made the change
- `field_name`: Field that changed
- `old_value`: Previous value
- `new_value`: New value
- `change_type`: Type of change
- `created_at`: Timestamp

#### `issue_templates`
Pre-built templates for common issues:
- `id`: Unique identifier
- `name`: Template name
- `description`: Template description
- `category_id`: Associated category
- `priority_id`: Associated priority
- `template_content`: Template content
- `is_active`: Whether template is active

## Setup Instructions

### 1. Database Setup

#### Automatic Setup (Recommended)
```bash
# Make the script executable
chmod +x scripts/setup-issue-reporting.sh

# Run the setup script
./scripts/setup-issue-reporting.sh
```

#### Manual Setup
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `backend/setup-issue-reporting.sql`
4. Execute the SQL

### 2. Backend Configuration

The backend routes are already configured in `backend/routes/issues.js` and integrated into the main application.

### 3. Frontend Configuration

The frontend component is located at `frontend/src/components/UI/IssueReporting.tsx` and is already integrated into the main navigation.

### 4. Environment Variables

Ensure these environment variables are set:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## API Endpoints

### Issue Management

#### Create Issue
```http
POST /api/issues
Content-Type: application/json

{
  "title": "Issue title",
  "description": "Detailed description",
  "categoryId": "uuid",
  "priorityId": "uuid",
  "outletId": "uuid",
  "attachments": [],
  "browserInfo": {},
  "deviceInfo": {},
  "pageUrl": "https://example.com",
  "userAgent": "Mozilla/5.0...",
  "screenResolution": "1920x1080"
}
```

#### Get User Issues
```http
GET /api/issues?status=open&category=bug&priority=high&outletId=uuid
```

#### Get Specific Issue
```http
GET /api/issues/{issueId}
```

#### Update Issue
```http
PUT /api/issues/{issueId}
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description"
}
```

#### Delete Issue
```http
DELETE /api/issues/{issueId}
```

### Comments

#### Add Comment
```http
POST /api/issues/{issueId}/comments
Content-Type: application/json

{
  "content": "Comment text",
  "attachments": []
}
```

### Metadata

#### Get Categories
```http
GET /api/issues/categories
```

#### Get Priorities
```http
GET /api/issues/priorities
```

#### Get Statuses
```http
GET /api/issues/statuses
```

#### Get Templates
```http
GET /api/issues/templates
```

#### Get User Outlets
```http
GET /api/issues/outlets
```

### Statistics

#### Get User Stats
```http
GET /api/issues/stats/overview
```

### History

#### Get Issue History
```http
GET /api/issues/{issueId}/history
```

## Usage Guide

### For Users

#### Creating an Issue
1. Navigate to "Issue Reporting" in the sidebar
2. Click "Report Issue" button
3. Choose a template (optional) or fill out the form manually
4. Select category, priority, and outlet (if applicable)
5. Provide a detailed description
6. Upload any relevant attachments
7. Submit the issue

#### Viewing Your Issues
1. Go to the Issue Reporting page
2. Use filters to find specific issues
3. Click on any issue to view details
4. Add comments or updates as needed

#### Issue Statuses
- **Open**: Issue has been reported and is awaiting review
- **In Progress**: Issue is being worked on
- **Waiting for User**: Waiting for user response or additional information
- **Resolved**: Issue has been resolved and is ready for testing
- **Closed**: Issue has been closed and verified
- **Duplicate**: Issue is a duplicate of another issue
- **Won't Fix**: Issue will not be fixed

### For Administrators

#### Managing Issues
- Monitor issue statistics and trends
- Assign issues to team members (future feature)
- Update issue statuses and priorities
- Add internal notes
- Track resolution times and SLA compliance

#### Customization
- Modify categories, priorities, and statuses
- Create custom templates
- Adjust SLA requirements
- Configure notification settings

## Security

### Row Level Security (RLS)
All tables have RLS policies that ensure:
- Users can only see their own issues
- Users can only modify their own issues
- Comments are restricted to issue owners
- History is restricted to issue owners

### File Upload Security
- File size limits (10MB per file)
- File type restrictions (images, PDFs, documents)
- Secure storage in Supabase Storage
- Virus scanning (recommended for production)

## Performance Considerations

### Database Optimization
- Indexes on frequently queried columns
- Efficient joins for related data
- Pagination for large result sets
- Caching for static data (categories, priorities, etc.)

### Frontend Optimization
- Lazy loading of issue lists
- Debounced search and filtering
- Optimistic updates for better UX
- Efficient re-rendering with React optimization

## Monitoring and Analytics

### Key Metrics
- Total issues created
- Issues by status
- Average resolution time
- Issues by category and priority
- User satisfaction (future feature)

### Alerts
- SLA violations
- High-priority issues without updates
- Issues waiting for user response
- System performance issues

## Troubleshooting

### Common Issues

#### Database Connection Errors
- Verify Supabase credentials
- Check network connectivity
- Ensure RLS policies are properly configured

#### File Upload Failures
- Check file size limits
- Verify file type restrictions
- Ensure storage bucket permissions

#### Permission Errors
- Verify user authentication
- Check RLS policies
- Ensure proper user roles

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=issues:*
```

## Future Enhancements

### Planned Features
- **Email Notifications**: Automatic email updates for issue status changes
- **Slack Integration**: Post issue updates to Slack channels
- **Advanced Search**: Full-text search with filters
- **Issue Templates**: More sophisticated template system
- **Time Tracking**: Track time spent on issues
- **Escalation Rules**: Automatic escalation for SLA violations
- **Knowledge Base**: Link issues to knowledge base articles
- **Mobile App**: Native mobile application
- **API Webhooks**: Webhook notifications for external integrations

### Customization Options
- **Custom Fields**: Add custom fields to issues
- **Workflow Automation**: Custom workflows and approval processes
- **Branding**: Customize colors, logos, and branding
- **Multi-language Support**: Internationalization
- **Advanced Reporting**: Custom reports and dashboards

## Support

For technical support or questions about the Issue Reporting System:
1. Check this documentation
2. Review the code comments
3. Check the troubleshooting section
4. Contact the development team

## Contributing

To contribute to the Issue Reporting System:
1. Follow the existing code style
2. Add comprehensive tests
3. Update documentation
4. Submit pull requests with detailed descriptions

---

*This guide covers the complete Issue Reporting System implementation. For additional information, refer to the inline code documentation and API specifications.*
