#!/usr/bin/env node
/**
 * Bootstrap remoto da VPS via SSH (uso único).
 * Uso: node scripts/vps-remote-bootstrap.mjs
 * Requer: SSH_HOST, SSH_PASSWORD (ou SSH_KEY_PATH)
 */
import { Client } from 'ssh2';
import { readFileSync } from 'node:fs';

const host = process.env.SSH_HOST ?? '145.223.31.172';
const username = process.env.SSH_USER ?? 'root';
const password = process.env.SSH_PASSWORD;
const keyPath = process.env.SSH_KEY_PATH;

const envContent = process.env.LIMOFLOW_ENV;
if (!envContent) {
  console.error('LIMOFLOW_ENV is required');
  process.exit(1);
}

function exec(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('data', (d) => {
        const s = d.toString();
        stdout += s;
        process.stdout.write(s);
      });
      stream.stderr.on('data', (d) => {
        const s = d.toString();
        stderr += s;
        process.stderr.write(s);
      });
      stream.on('close', (code) => {
        if (code === 0) resolve({ stdout, stderr });
        else reject(new Error(`Command failed (${code}): ${cmd}\n${stderr}`));
      });
    });
  });
}

function writeFile(conn, path, content) {
  const b64 = Buffer.from(content, 'utf8').toString('base64');
  return exec(conn, `echo '${b64}' | base64 -d > ${path}`);
}

const bootstrapScript = `set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi
if [ ! -d /opt/limoflow/.git ]; then
  git clone --branch master https://github.com/JonasZanivam/limo_flow.git /opt/limoflow
else
  cd /opt/limoflow
  git fetch origin master
  git checkout master
  git pull origin master
fi
`;

const deployScript = `set -euo pipefail
cd /opt/limoflow
docker compose -f docker-compose.prod.yml --env-file .env build
docker compose -f docker-compose.prod.yml --env-file .env up -d
docker compose -f docker-compose.prod.yml ps
sleep 5
curl -fsS http://localhost/api/health || (docker compose -f docker-compose.prod.yml logs --tail=80 backend; exit 1)
`;

const conn = new Client();

conn
  .on('ready', async () => {
    try {
      console.log('SSH connected. Running bootstrap...');
      await exec(conn, bootstrapScript);
      console.log('Writing .env...');
      await writeFile(conn, '/opt/limoflow/.env', envContent);
      console.log('Building and starting containers...');
      await exec(conn, deployScript);
      console.log('Deploy finished successfully.');
      conn.end();
      process.exit(0);
    } catch (error) {
      console.error(error);
      conn.end();
      process.exit(1);
    }
  })
  .on('error', (err) => {
    console.error('SSH error:', err.message);
    process.exit(1);
  });

const connectOpts = { host, port: 22, username };
if (keyPath) {
  connectOpts.privateKey = readFileSync(keyPath);
} else if (password) {
  connectOpts.password = password;
} else {
  console.error('SSH_PASSWORD or SSH_KEY_PATH required');
  process.exit(1);
}

conn.connect(connectOpts);
