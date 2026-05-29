/**
 * Run all database migrations on Supabase
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

// For migrations, we need to use a service role key or run in SQL Editor
// Since we only have the anon key, we'll provide instructions

async function runMigrations() {
  console.log('🚀 FlatFit Database Migration\n');
  console.log('📊 Project:', supabaseUrl);
  console.log('');

  // Read migration files
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const migrations = [
    '001_initial_schema.sql',
    '002_simple_auth.sql'
  ];

  console.log('📝 Migrations to run:');
  migrations.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
  console.log('');

  // Combine all migrations into one
  let combinedSql = '-- FlatFit Complete Database Setup\n';
  combinedSql += '-- Generated: ' + new Date().toISOString() + '\n\n';

  migrations.forEach((file) => {
    const filePath = path.join(migrationsDir, file);
    if (fs.existsSync(filePath)) {
      const sql = fs.readFileSync(filePath, 'utf8');
      combinedSql += `\n-- ====================================\n`;
      combinedSql += `-- Migration: ${file}\n`;
      combinedSql += `-- ====================================\n\n`;
      combinedSql += sql;
      combinedSql += '\n\n';
    }
  });

  // Write combined migration
  const outputPath = path.join(__dirname, '..', 'supabase', 'COMBINED_MIGRATION.sql');
  fs.writeFileSync(outputPath, combinedSql);

  console.log('✅ Combined migration file created: supabase/COMBINED_MIGRATION.sql\n');
  console.log('⚠️  IMPORTANT: You need to run this SQL in the Supabase dashboard\n');
  console.log('📋 Steps to run migration:\n');
  console.log('1. Go to: https://supabase.com/dashboard/project/yegevmpfjxoubpmuanoo/sql');
  console.log('2. Click "New Query"');
  console.log('3. Copy contents of: supabase/COMBINED_MIGRATION.sql');
  console.log('4. Paste into SQL Editor');
  console.log('5. Click "Run"\n');
  console.log('After running, test with: npm run test-connection\n');

  // Also save to clipboard if possible
  try {
    const { exec } = require('child_process');
    exec(`cat "${outputPath}" | pbcopy`, (error) => {
      if (!error) {
        console.log('✨ Migration SQL copied to clipboard!\n');
      }
    });
  } catch (e) {
    // Clipboard copy not available, that's ok
  }
}

runMigrations();
