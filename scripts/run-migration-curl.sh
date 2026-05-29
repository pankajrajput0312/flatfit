#!/bin/bash

# Load environment variables
source .env.local

# Read the SQL file
SQL=$(cat supabase/SIMPLE_SETUP.sql)

echo "🚀 Running migration via Supabase API..."
echo ""

# Try to execute SQL via Supabase's postgrest API
# Note: This typically requires service_role key for DDL operations

curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": $(echo "$SQL" | jq -Rs .)}"

echo ""
echo ""
echo "⚠️  If you see an error above, the anon key doesn't have DDL permissions."
echo "Please run the migration manually in Supabase SQL Editor:"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/yegevmpfjxoubpmuanoo/sql"
echo "2. Click 'New Query'"
echo "3. Copy/paste contents of: supabase/SIMPLE_SETUP.sql"
echo "4. Click 'Run'"
echo ""
