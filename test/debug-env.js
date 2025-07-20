const fs = require('fs');

console.log('Testing environment file reading...');

const content = fs.readFileSync('frontend/.env', 'utf8');
console.log('Raw content length:', content.length);
console.log('Contains VITE_SUPABASE_URL:', content.includes('VITE_SUPABASE_URL'));
console.log('Contains VITE_SUPABASE_ANON_KEY:', content.includes('VITE_SUPABASE_ANON_KEY'));

const normalizedContent = content.replace(/\r\n/g, '\n');
console.log('Normalized content length:', normalizedContent.length);
console.log('Normalized contains VITE_SUPABASE_URL:', normalizedContent.includes('VITE_SUPABASE_URL'));
console.log('Normalized contains VITE_SUPABASE_ANON_KEY:', normalizedContent.includes('VITE_SUPABASE_ANON_KEY'));

console.log('First 100 characters:', content.substring(0, 100)); 