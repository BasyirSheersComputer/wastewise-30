/**
 * Test Chat/FAQ System
 * Tests the FAQ chat system with sample queries
 */

import dotenv from 'dotenv';
dotenv.config();

import FAQChatService from './services/faqChatService.js';
import { supabase } from './services/supabaseClient.js';

const TEST_SESSION_ID = 'test-session-' + Date.now();
const TEST_USER_ID = '00000000-0000-0000-0000-000000000000';

console.log('💬 Testing Chat/FAQ System\n');
console.log('═══════════════════════════════════════\n');

// Initialize FAQ Chat Service
const faqChatService = new FAQChatService({ 
  supabase, 
  useLLM: false, // Use simple responses for testing
  minConfidence: 0.3
});

// Test queries
const testQueries = [
  { query: 'How do I get started?', expected: 'getting started' },
  { query: 'What POS systems can I connect?', expected: 'integrations' },
  { query: 'How accurate is forecasting?', expected: 'forecast' },
  { query: 'How much does it cost?', expected: 'pricing' },
  { query: 'My sync is not working', expected: 'troubleshooting' },
  { query: 'Can I cancel my subscription?', expected: 'cancel' }
];

async function testChatSystem() {
  console.log('🧪 Running FAQ Chat Tests...\n');

  for (const test of testQueries) {
    console.log(`📝 User: "${test.query}"`);
    
    try {
      const result = await faqChatService.processMessage(
        TEST_SESSION_ID,
        TEST_USER_ID,
        test.query
      );

      if (result.success) {
        console.log(`✅ Bot: ${result.response.substring(0, 100)}...`);
        
        if (result.faq_article) {
          console.log(`   📄 FAQ Match: "${result.faq_article.title}" (confidence: ${(result.confidence * 100).toFixed(1)}%)`);
        }
        
        if (result.should_escalate) {
          console.log(`   ⚠️  Suggests escalation`);
        }
        
        if (result.suggested_articles && result.suggested_articles.length > 0) {
          console.log(`   💡 Suggested articles: ${result.suggested_articles.length}`);
        }
      } else {
        console.log(`❌ Failed to process message`);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
    
    console.log('');
  }

  // Test escalation
  console.log('🔔 Testing Escalation...\n');
  console.log('📝 User: "This still doesn\'t help me"');
  
  try {
    const escalation = await faqChatService.escalateToRep(
      TEST_SESSION_ID,
      TEST_USER_ID,
      'User not satisfied with FAQ response'
    );

    if (escalation.success && escalation.escalated) {
      console.log(`✅ Escalated successfully`);
      console.log(`   📧 Contact: ${escalation.contact_info.email}`);
      console.log(`   📞 Phone: ${escalation.contact_info.phone}`);
    }
  } catch (error) {
    console.error(`❌ Escalation failed: ${error.message}`);
  }

  console.log('\n═══════════════════════════════════════');
  console.log('✅ Chat System Test Complete');
  console.log('═══════════════════════════════════════\n');
}

// Run tests
testChatSystem().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

