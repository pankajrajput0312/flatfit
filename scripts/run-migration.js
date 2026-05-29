/**
 * Run database migration on Supabase
 *
 * Usage: node scripts/run-migration.js
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

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...\n');

    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log('📝 Executing SQL...\n');

    // Note: The anon key doesn't have permission to run DDL statements
    // You need to run this manually in the Supabase SQL Editor
    console.log('⚠️  IMPORTANT:');
    console.log('The anon key cannot run database migrations.');
    console.log('Please follow these steps:\n');
    console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/yegevmpfjxoubpmuanoo');
    console.log('2. Click on "SQL Editor" in the left sidebar');
    console.log('3. Click "New Query"');
    console.log('4. Copy the contents of: supabase/migrations/001_initial_schema.sql');
    console.log('5. Paste into the SQL Editor');
    console.log('6. Click "Run" (bottom right)\n');
    console.log('After running the migration, you can test the connection with:');
    console.log('npm run test-connection\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runMigration();
