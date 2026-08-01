#!/usr/bin/env node
import { Client } from 'ssh2';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const host = process.env.SSH_HOST ?? '145.223.31.172';
const domain = process.env.DOMAIN ?? 'jonjon.tech';
const keyPath =
  process.env.SSH_KEY_PATH ??
  resolve(process.env.USERPROFILE ?? '', '.ssh/limoflow_vps_deploy');
const password = process.env.SSH_PASSWORD;

const setupScript = `set -euo pipefail
DOMAIN="${domain}"
APP_DIR=/opt/limoflow

cd "$APP_DIR"

# Move app para porta interna 8080 (Caddy ficará na 80/443)
if grep -q '^HTTP_PORT=' .env; then
  sed -i 's/^HTTP_PORT=.*/HTTP_PORT=8080/' .env
else
  echo 'HTTP_PORT=8080' >> .env
fi

# FRONTEND_URL será https após o Caddy subir
sed -i "s|^FRONTEND_URL=.*|FRONTEND_URL=https://\${DOMAIN}|" .env

docker compose -f docker-compose.prod.yml --env-file .env up -d

# Instalar Caddy se necessário
if ! command -v caddy >/dev/null 2>&1; then
  apt-get update -qq
  apt-get install -y -qq debian-keyring debian-archive-keyring apt-transport-https curl
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -qq
  apt-get install -y -qq caddy
fi

cat > /etc/caddy/Caddyfile <<EOF
\${DOMAIN}, www.\${DOMAIN} {
    reverse_proxy localhost:8080
}
EOF

systemctl enable caddy
systemctl restart caddy

sleep 5
docker compose -f docker-compose.prod.yml restart backend
sleep 5

echo '--- STATUS ---'
docker compose -f docker-compose.prod.yml ps
systemctl is-active caddy
grep -E '^(FRONTEND_URL|HTTP_PORT)=' .env
curl -fsS "https://\${DOMAIN}/api/health"
echo
curl -fsS -o /dev/null -w "frontend_https=%{http_code}\\n" "https://\${DOMAIN}/"
`;

function exec(conn, command) {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      stream.on('data', (d) => process.stdout.write(d));
      stream.stderr.on('data', (d) => process.stderr.write(d));
      stream.on('close', (code) =>
        code === 0 ? resolve() : reject(new Error(`exit ${code}`)),
      );
    });
  });
}

const conn = new Client();
conn
  .on('ready', async () => {
    try {
      await exec(conn, setupScript);
      conn.end();
    } catch (error) {
      console.error(error);
      conn.end();
      process.exit(1);
    }
  })
  .on('error', (err) => {
    console.error(err.message);
    process.exit(1);
  });

const opts = { host, port: 22, username: 'root' };
if (password) opts.password = password;
else opts.privateKey = readFileSync(keyPath);

conn.connect(opts);
