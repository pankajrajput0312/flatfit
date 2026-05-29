/**
 * Wait for migration to complete by polling database
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

let attempts = 0;
const maxAttempts = 60; // Wait up to 60 seconds

async function checkMigration() {
  try {
    // Try to query members table
    const { data, error } = await supabase
      .from('members')
      .select('count')
      .limit(0);

    if (error) {
      // Table doesn't exist yet
      if (attempts < maxAttempts) {
        attempts++;
        process.stdout.write('\r⏳ Waiting for migration... (' + attempts + 's)');
        setTimeout(checkMigration, 1000);
      } else {
        console.log('\n\n❌ Timeout waiting for migration');
        console.log('Please ensure you ran the SQL in Supabase SQL Editor');
        process.exit(1);
      }
    } else {
      // Table exists!
      console.log('\n\n✅ Migration detected!');
      console.log('🎉 Database is ready!\n');
      console.log('Next steps:');
      console.log('1. npm run dev');
      console.log('2. Open http://localhost:3000');
      console.log('3. Sign up and start tracking!\n');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

console.log('🔍 Checking if migration has been completed...');
console.log('(Paste the SQL in your browser and click Run)\n');
checkMigration();
