#!/usr/bin/env bash
# Обновить сайт на сервере после коммита и пуша в main:  bash /var/www/sloyka/scripts/server-update.sh
set -euo pipefail
cd /var/www/sloyka
git pull --ff-only
npm ci
npx prisma generate
npx prisma db push
npm run build
systemctl restart sloyka
echo "Сайт обновлён"
