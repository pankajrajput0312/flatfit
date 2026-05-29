#!/bin/bash

echo "🚀 Opening Supabase SQL Editor..."
echo ""
echo "The migration SQL has been copied to your clipboard!"
echo ""
echo "In the browser that opens:"
echo "1. Click 'New Query'"
echo "2. Paste (Cmd+V)"
echo "3. Click 'Run'"
echo ""

# Copy SQL to clipboard
cat supabase/SIMPLE_SETUP.sql | pbcopy

# Open Supabase SQL Editor
open "https://supabase.com/dashboard/project/yegevmpfjxoubpmuanoo/sql"

echo "✅ Browser opened and SQL copied to clipboard"
echo ""
echo "After running the migration, test with:"
echo "  npm run test-connection"
echo ""
