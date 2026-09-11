#!/bin/bash
# LexAI Business AI - Offer 94697 - Kimi Code Deploy Pack
# Usage: bash deploy.sh  OR  ./deploy.sh
# For Kimi Code: kimicode agent run "bash lexai-deploy/deploy.sh"

set -e
echo "🚀 LexAI Business AI - Offer 94697 Deploy - Kimi Code"

# Paths - adjust to your server
DOMAIN_ROOT="/var/www/lexai.llc"
BUSINESS_DIR="$DOMAIN_ROOT/business"
AFF_DIR="$DOMAIN_ROOT/affiliates"
WEBHOOK_DIR="$DOMAIN_ROOT/webhook"

echo "📁 Creating dirs..."
mkdir -p $BUSINESS_DIR $AFF_DIR $WEBHOOK_DIR

# If running locally (no /var/www), use ./lexai-deploy output
if [ ! -w "/var/www" ]; then
  echo "⚠️  No write to /var/www - deploying locally to ./deploy_output"
  BUSINESS_DIR="./deploy_output/business"
  AFF_DIR="./deploy_output/affiliates"
  WEBHOOK_DIR="./deploy_output/webhook"
  mkdir -p $BUSINESS_DIR $AFF_DIR $WEBHOOK_DIR
fi

echo "📄 Copying sales pages..."
cp business/index.html $BUSINESS_DIR/index.html
cp affiliates/index.html $AFF_DIR/index.html
cp webhook/warriorplus-ipn.php $WEBHOOK_DIR/
cp webhook/warriorplus-ipn.js $WEBHOOK_DIR/

echo "✅ Files copied:"
ls -lh $BUSINESS_DIR/index.html $AFF_DIR/index.html $WEBHOOK_DIR/

echo ""
echo "🔧 NEXT STEPS FOR KIMICODE:"
echo "1. Upload to lexai.llc via FTP/SCP:"
echo "   scp -r deploy_output/business/* user@lexai.llc:/var/www/lexai.llc/business/"
echo "   scp -r deploy_output/affiliates/* user@lexai.llc:/var/www/lexai.llc/affiliates/"
echo "   scp -r deploy_output/webhook/* user@lexai.llc:/var/www/lexai.llc/webhook/"
echo ""
echo "2. Set WarriorPlus IPN URL to:"
echo "   https://lexai.llc/webhook/warriorplus-ipn.php"
echo ""
echo "3. Update WordPress (if using WP):"
echo "   - Create Page /business -> paste business/index.html in Custom HTML block"
echo "   - Or use: wp post create --post_type=page --post_title='Business' --post_content="$(cat business/index.html)""
echo ""
echo "4. Test Offer 94697 link:"
echo "   https://warriorplus.com/o2/a/94697/0"
echo ""
echo "🎉 DONE - Offer 94697 ready for Kimi Code to push"

# Optional: start Node webhook if Node installed
if command -v node &> /dev/null; then
  echo "📦 Node detected - to start webhook: node webhook/warriorplus-ipn.js"
fi
