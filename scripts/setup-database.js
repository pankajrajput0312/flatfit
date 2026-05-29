/**
 * Automated Supabase Database Setup
 * Runs the migration using Supabase API
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

async function setupDatabase() {
  console.log('🚀 FlatFit Database Setup\n');
  console.log('📊 Project:', supabaseUrl);
  console.log('');

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Read the migration SQL
  const sqlPath = path.join(__dirname, '..', 'supabase', 'SIMPLE_SETUP.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('📝 Running migration...\n');

  try {
    // Try to execute via RPC (this usually requires service role key)
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If RPC doesn't exist or fails, try direct table creation
      console.log('⚠️  Direct SQL execution not available with anon key\n');
      console.log('Please run the migration manually:\n');
      console.log('1. Go to: https://supabase.com/dashboard/project/yegevmpfjxoubpmuanoo/sql');
      console.log('2. Click "New Query"');
      console.log('3. Paste the contents of: supabase/SIMPLE_SETUP.sql');
      console.log('4. Click "Run"\n');
      return;
    }

    console.log('✅ Migration completed successfully!\n');

    // Verify tables were created
    await verifySetup(supabase);

  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    console.log('\nPlease run the migration manually in Supabase SQL Editor.');
  }
}

async function verifySetup(supabase) {
  console.log('🔍 Verifying setup...\n');

  try {
    // Check members table
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('count')
      .limit(0);

    if (membersError) {
      console.log('❌ Members table check failed');
      return false;
    }

    console.log('✅ Members table exists');

    // Check daily_logs table
    const { data: logs, error: logsError } = await supabase
      .from('daily_logs')
      .select('count')
      .limit(0);

    if (logsError) {
      console.log('❌ Daily logs table check failed');
      return false;
    }

    console.log('✅ Daily logs table exists\n');
    console.log('🎉 Database setup complete!\n');
    console.log('Next steps:');
    console.log('1. npm run dev');
    console.log('2. Open http://localhost:3000');
    console.log('3. Sign up and start tracking!\n');

    return true;

  } catch (error) {
    console.error('Verification error:', error.message);
    return false;
  }
}

setupDatabase();
