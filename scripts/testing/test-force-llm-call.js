// Test script to force LLM calls and bypass idle state
const { getRecommendations } = require('./backend/recommendations.js');

async function testForceLLMCall() {
  console.log('🔍 Testing Force LLM Call...\n');
  
  try {
    console.log('📞 Making direct LLM call (bypassing idle state)...');
    
    // Test with different sections to see if responses vary
    const sections = ['dashboard', 'waste', 'inventory'];
    
    for (const section of sections) {
      console.log(`\n📊 Testing section: ${section}`);
      
      const startTime = Date.now();
      const result = await getRecommendations(section, 'gemini');
      const duration = Date.now() - startTime;
      
      console.log(`⏱️  Response time: ${duration}ms`);
      console.log(`🤖 Provider: ${result.provider}`);
      console.log(`📝 Response length: ${result.recommendations?.length || 0} characters`);
      
      // Show first 200 characters of response
      const preview = result.recommendations?.substring(0, 200) || 'No response';
      console.log(`📄 Preview: ${preview}...`);
      
      // Check if response looks dynamic
      if (result.recommendations?.includes('default') || 
          result.recommendations?.includes('temporarily unavailable') ||
          result.recommendations?.includes('Unable to generate')) {
        console.log('⚠️  WARNING: Response appears to be default/static');
      } else {
        console.log('✅ Response appears to be dynamic');
      }
      
      // Wait between calls
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
  } catch (error) {
    console.error('❌ Error testing LLM call:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n🔑 API Key Issue Detected:');
      console.log('- Check if GEMINI_API_KEY is properly set');
      console.log('- Verify the API key is valid');
      console.log('- Ensure the key has proper permissions');
    }
  }
}

// Run the test
testForceLLMCall();
