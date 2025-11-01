# Chat/FAQ System Guide

## Overview
The internal chat system provides keyword-based FAQ queries with natural language responses. When users are not satisfied, the system suggests connecting to a customer representative.

## Features

- **Keyword-Based FAQ Matching**: Extracts keywords from user queries and matches against FAQ database
- **Natural Language Responses**: Uses LLM (Gemini/ChatGPT) to generate conversational responses
- **Smart Escalation**: Automatically suggests customer rep when user is unsatisfied
- **Multi-turn Conversations**: Maintains session context
- **Satisfaction Tracking**: Records user feedback to improve FAQ quality

## Database Schema

### Tables
- `faq_categories` - FAQ categories
- `faq_articles` - FAQ articles with keywords
- `faq_keywords` - Keywords and synonyms for matching
- `chat_sessions` - Chat session management
- `chat_messages` - Individual messages
- `chat_escalations` - Escalation requests

## API Endpoints

### Create Chat Session
```http
POST /api/chat/session
Authorization: Bearer <token>

Response:
{
  "success": true,
  "session": {
    "id": "uuid",
    "session_key": "key",
    "user_id": "uuid",
    "status": "active"
  }
}
```

### Send Message
```http
POST /api/chat/message
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "session-id",
  "message": "How do I connect StoreHub?",
  "userId": "user-id"
}

Response:
{
  "success": true,
  "response": "To connect StoreHub, navigate to Settings...",
  "faq_article": {
    "id": "uuid",
    "title": "How do I connect StoreHub POS?",
    "category": "Integrations"
  },
  "suggested_articles": [
    { "id": "uuid", "title": "..." }
  ],
  "confidence": 0.85,
  "should_escalate": false,
  "can_escalate": false
}
```

### Escalate to Customer Rep
```http
POST /api/chat/escalate
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "session-id",
  "reason": "Still need help"
}

Response:
{
  "success": true,
  "escalated": true,
  "escalation_id": "uuid",
  "contact_info": {
    "email": "support@wastewise.ai",
    "phone": "+60 3-XXXX XXXX",
    "message": "A customer representative will contact you within 24 hours."
  }
}
```

### Record Satisfaction
```http
POST /api/chat/satisfaction
Authorization: Bearer <token>
Content-Type: application/json

{
  "messageId": "message-id",
  "isSatisfied": true
}
```

### Search FAQ
```http
GET /api/chat/faq/search?query=pricing&limit=10

Response:
{
  "success": true,
  "articles": [
    {
      "id": "uuid",
      "title": "What are the pricing plans?",
      "content": "...",
      "category": "Billing & Plans",
      "keywords": ["pricing", "price", "cost"],
      "view_count": 42,
      "helpful_count": 38
    }
  ]
}
```

### Get FAQ Categories
```http
GET /api/chat/faq/categories

Response:
{
  "success": true,
  "categories": [
    {
      "id": "uuid",
      "name": "Getting Started",
      "description": "...",
      "icon": "🚀"
    }
  ]
}
```

## How It Works

### 1. Keyword Extraction
- Converts message to lowercase
- Removes punctuation
- Filters stop words (the, a, an, etc.)
- Extracts meaningful keywords (length > 2 characters)

### 2. FAQ Matching
- Searches FAQ articles by keywords
- Calculates relevance score based on:
  - Direct keyword matches (+0.3)
  - Text contains keyword (+0.1)
  - Article priority (+0.1 per priority level)
- Returns articles with confidence ≥ 0.3

### 3. Response Generation
- **High Confidence (≥0.3)**: Uses FAQ content, optionally enhanced by LLM
- **Low Confidence**: Suggests related articles
- **No Match**: Suggests escalation

### 4. Escalation Logic
- Tracks user satisfaction (thumbs up/down)
- Counts "not helpful" responses
- Escalates after 2+ unsatisfied responses
- Creates escalation record for customer rep

## Configuration

```javascript
const faqChatService = new FAQChatService({
  supabase: supabaseClient,
  useLLM: true,              // Use LLM for natural responses
  minConfidence: 0.3,        // Minimum confidence for FAQ match
  escalationThreshold: 2     // Failed attempts before escalation
});
```

## Chat Flow Example

```
User: "How do I connect StoreHub?"
  ↓
Bot extracts keywords: ["connect", "storehub"]
  ↓
Searches FAQ database
  ↓
Finds match: "How do I connect StoreHub POS?" (confidence: 0.85)
  ↓
Generates response using FAQ content
  ↓
User: "This doesn't help"
  ↓
Bot detects unsatisfied response
  ↓
Suggests: "Would you like me to connect you with a customer representative?"
  ↓
User: "Yes"
  ↓
Bot escalates and provides contact info
```

## FAQ Management

### Adding FAQ Articles

```sql
INSERT INTO faq_articles (category_id, title, content, keywords, priority)
VALUES (
  'category-uuid',
  'Article Title',
  'Article content here...',
  ARRAY['keyword1', 'keyword2', 'keyword3'],
  10  -- Priority (higher = more relevant)
);
```

### Categories

1. **Getting Started** 🚀 - Setup and onboarding
2. **Integrations** 🔌 - POS, ERP, CRM, WFM connections
3. **AI Features** 🤖 - Forecasting, recommendations
4. **Billing & Plans** 💳 - Pricing and subscriptions
5. **Troubleshooting** 🔧 - Common issues
6. **Account Management** 👤 - User accounts and settings

## Testing

```bash
# Test chat system
node backend/test-chat-system.js

# Seed FAQ data
psql -d wastewise -f backend/database/seed_faq_data.sql
```

## Integration with Frontend

```javascript
// Create session
const session = await fetch('/api/chat/session', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// Send message
const response = await fetch('/api/chat/message', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sessionId: session.session.id,
    message: userMessage
  })
}).then(r => r.json());

// Handle response
if (response.should_escalate || response.can_escalate) {
  // Show escalation prompt
  showEscalationPrompt();
}
```

## Future Enhancements

- Multi-language support
- Voice chat integration
- Chat history search
- Predefined quick replies
- Customer rep dashboard for escalations
- Analytics and reporting on FAQ effectiveness

## Related Documentation
- [Database Schema](../../backend/database/migrations/create_faq_system.sql)
- [FAQ Seed Data](../../backend/database/seed_faq_data.sql)
- [Chat Service](../../backend/services/faqChatService.js)

