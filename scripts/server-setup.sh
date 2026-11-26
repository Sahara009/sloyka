#!/usr/bin/env bash
# Первичная настройка сервера Sloyka (Ubuntu 22.04 / 24.04).
# Запуск на сервере под root:
#   curl -fsSL https://raw.githubusercontent.com/sahara009/sloyka/main/scripts/server-setup.sh -o setup.sh && bash setup.sh
# Скрипт можно запускать повторно — он ничего не ломает, только доустанавливает недостающее.
set -euo pipefail

DOMAIN="sloyka-home.ru"
EMAIL="sloyka.home@mail.ru"
REPO="https://github.com/sahara009/sloyka.git"
APP=/var/www/sloyka
DB=sloyka
ENVF="$APP/.env.local"

say() { echo -e "\n\033[1;35m== $* ==\033[0m"; }
ask() { local v; read -r -p "$1: " v </dev/tty; echo "$v"; }

say "1/9 Обновляю систему и ставлю пакеты"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y curl git nginx postgresql ufw certbot python3-certbot-nginx openssl ca-certificates

say "2/9 Файл подкачки 2 ГБ (чтобы сборка сайта не падала от нехватки памяти)"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  grep -q /swapfile /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

say "3/9 Node.js 22"
if ! command -v node >/dev/null || ! node -v | grep -q '^v22'; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
node -v

say "4/9 База PostgreSQL"
if [ -f "$ENVF" ] && grep -q '^DATABASE_URL=' "$ENVF"; then
  echo "База уже настроена"
else
  DBPASS=$(openssl rand -hex 16)
  sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$DB'" | grep -q 1 \
    && sudo -u postgres psql -c "ALTER USER $DB WITH PASSWORD '$DBPASS';" \
    || sudo -u postgres psql -c "CREATE USER $DB WITH PASSWORD '$DBPASS';"
  sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB'" | grep -q 1 \
    || sudo -u postgres psql -c "CREATE DATABASE $DB OWNER $DB;"
fi

say "5/9 Код сайта"
if [ -d "$APP/.git" ]; then
  git -C "$APP" pull --ff-only
else
  mkdir -p /var/www
  git clone "$REPO" "$APP"
fi

say "6/9 Ключи (.env.local)"
if [ -f "$ENVF" ]; then
  echo "Файл ключей уже есть: $ENVF (чтобы поменять: nano $ENVF)"
else
  echo "Сейчас спрошу ключи. Вставлять — правой кнопкой мыши или Ctrl+Shift+V."
  YK_ID=$(ask "ЮKassa shopId")
  YK_KEY=$(ask "ЮKassa секретный ключ (live_...)")
  CDEK_A=$(ask "СДЭК Account")
  CDEK_S=$(ask "СДЭК Secure password")
  ADMIN_PW=$(ask "Пароль для входа в админку")
  cat > "$ENVF" <<EOF
NEXT_PUBLIC_SITE_URL=https://$DOMAIN
DATABASE_URL=postgresql://$DB:$DBPASS@localhost:5432/$DB?schema=public
CATALOG_SOURCE=static
ADMIN_PASSWORD=$ADMIN_PW
ADMIN_SECRET=$(openssl rand -hex 32)
YOOKASSA_SHOP_ID=$YK_ID
YOOKASSA_SECRET_KEY=$YK_KEY
CDEK_ACCOUNT=$CDEK_A
CDEK_SECURE=$CDEK_S
CDEK_TEST=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
EOF
  chmod 600 "$ENVF"
fi

say "7/9 Сборка сайта (5–10 минут)"
cd "$APP"
npm ci
npx prisma generate
npx prisma db push
npm run build

say "8/9 Автозапуск и nginx"
cat > /etc/systemd/system/sloyka.service <<EOF
[Unit]
Description=Sloyka site
After=network.target postgresql.service

[Service]
WorkingDirectory=$APP
ExecStart=/usr/bin/npm run start -- -p 3000 -H 127.0.0.1
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now sloyka
systemctl restart sloyka

cat > /etc/nginx/sites-available/sloyka <<EOF
server {
  listen 80 default_server;
  server_name $DOMAIN www.$DOMAIN _;
  client_max_body_size 10m;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
EOF
ln -sf /etc/nginx/sites-available/sloyka /etc/nginx/sites-enabled/sloyka
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

ufw allow OpenSSH >/dev/null
ufw allow 'Nginx Full' >/dev/null
ufw --force enable >/dev/null

say "9/9 Ежедневная копия базы (хранится 14 дней)"
mkdir -p /var/backups/sloyka
cat > /etc/cron.daily/sloyka-backup <<EOF
#!/bin/sh
sudo -u postgres pg_dump $DB | gzip > /var/backups/sloyka/sloyka-\$(date +%F).sql.gz
find /var/backups/sloyka -name '*.sql.gz' -mtime +14 -delete
EOF
chmod +x /etc/cron.daily/sloyka-backup

say "SSL-сертификат (https)"
if certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect; then
  echo "SSL готов: https://$DOMAIN"
else
  echo "SSL пока не получился — домен ещё не дошёл до сервера (это нормально в первые часы)."
  echo "Позже выполните:  certbot --nginx -d $DOMAIN -d www.$DOMAIN --agree-tos -m $EMAIL --redirect"
fi

say "Готово"
echo "Сайт работает. Проверка до подключения домена: http://$(curl -s ifconfig.me || echo IP-сервера)"
echo "Админка: https://$DOMAIN/admin"
echo "Обновить сайт после изменений: bash $APP/scripts/server-update.sh"
