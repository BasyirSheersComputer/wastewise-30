// Simple Connection Test Script
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔗 Quick Connection Test\n');

async function quickTest() {
  const results = [];
  
  // Test 1: Backend Health
  try {
    const response = await fetch('http://localhost:3000/health');
    const data = await response.json();
    if (response.ok && data.status === 'healthy') {
      results.push('✅ Backend: Running');
    } else {
      results.push('❌ Backend: Not responding');
    }
  } catch (error) {
    results.push('❌ Backend: Connection failed');
  }
  
  // Test 2: Frontend Accessibility
  try {
    const response = await fetch('http://localhost:5173');
    if (response.ok) {
      results.push('✅ Frontend: Accessible');
    } else {
      results.push('❌ Frontend: Not accessible');
    }
  } catch (error) {
    results.push('❌ Frontend: Connection failed');
  }
  
  // Test 3: Database Connection
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      results.push('❌ Database: Environment variables missing');
    } else {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.from('users').select('count').limit(1);
      
      if (error) {
        results.push('❌ Database: Connection failed');
      } else {
        results.push('✅ Database: Connected');
      }
    }
  } catch (error) {
    results.push('❌ Database: Error occurred');
  }
  
  // Display results
  console.log('Test Results:');
  console.log('='.repeat(30));
  results.forEach(result => console.log(result));
  console.log('='.repeat(30));
  
  const passed = results.filter(r => r.startsWith('✅')).length;
  const total = results.length;
  
  console.log(`\nSummary: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All systems are connected!');
  } else {
    console.log('⚠️  Some issues detected. Check the failed tests above.');
  }
}

quickTest().catch(console.error);
