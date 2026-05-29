/**
 * Test Supabase connection and check if tables exist
 *
 * Usage: node scripts/test-connection.js
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey.substring(0, 20) + '...\n');

  try {
    // Test members table
    console.log('📋 Checking members table...');
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('*')
      .limit(1);

    if (membersError) {
      console.error('❌ Members table error:', membersError.message);
      console.log('\n⚠️  Run the database migration first!');
      console.log('See: scripts/run-migration.js\n');
      return;
    }
    console.log('✅ Members table exists');
    console.log(`   Found ${members?.length || 0} members\n`);

    // Test daily_logs table
    console.log('📋 Checking daily_logs table...');
    const { data: logs, error: logsError } = await supabase
      .from('daily_logs')
      .select('*')
      .limit(1);

    if (logsError) {
      console.error('❌ Daily logs table error:', logsError.message);
      return;
    }
    console.log('✅ Daily logs table exists');
    console.log(`   Found ${logs?.length || 0} logs\n`);

    console.log('🎉 Connection successful! Database is ready.\n');
    console.log('Next steps:');
    console.log('1. Start the dev server: npm run dev');
    console.log('2. Open: http://localhost:3000');
    console.log('3. Sign in and complete onboarding\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConnection();
