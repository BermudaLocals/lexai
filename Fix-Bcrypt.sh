#!/bin/bash
set -e
cd /root/lexai-app

echo "=== Check package.json ==="
cat package.json

echo "=== Add bcryptjs if missing ==="
if ! grep -q "bcryptjs" package.json; then
  echo "Adding bcryptjs to package.json..."
  # Use python to edit JSON safely
  python3 -c "
import json
with open('package.json','r') as f:
    data=json.load(f)
data['dependencies']['bcryptjs']='^2.4.3'
with open('package.json','w') as f:
    json.dump(data,f,indent=2)
"
  cat package.json | grep -A2 -B2 bcryptjs
fi

echo "=== Force rebuild WITHOUT cache so npm install runs ==="
docker rm -f lexai-app || true
docker build --no-cache -t lexai-app:latest .
docker run -d --name lexai-app -p 3006:3000 --env-file .env --restart always lexai-app:latest
sleep 6
docker logs lexai-app --tail 40

echo "=== Push to Railway ==="
git add package.json
git commit -m "fix 502 - add bcryptjs to package.json - missing module crash" || true
git push origin main
railway up --detach
sleep 8
curl -I https://www.lexai.llc/business || true
echo ""
curl -s https://www.lexai.llc/api/status; echo ""
