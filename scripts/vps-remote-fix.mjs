#!/usr/bin/env node
import { Client } from 'ssh2';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const host = process.env.SSH_HOST ?? '145.223.31.172';
const password = process.env.SSH_PASSWORD;

const entrypoint = readFileSync(
  resolve(root, 'backend/docker-entrypoint.sh'),
  'utf8',
);
const dockerfile = readFileSync(resolve(root, 'backend/Dockerfile'), 'utf8');

function b64(text) {
  return Buffer.from(text, 'utf8').toString('base64');
}

const cmd = [
  'set -e',
  'cd /opt/limoflow',
  `echo '${b64(entrypoint)}' | base64 -d > backend/docker-entrypoint.sh`,
  `echo '${b64(dockerfile)}' | base64 -d > backend/Dockerfile`,
  'chmod +x backend/docker-entrypoint.sh',
  "sed -i 's/\\r$//' backend/docker-entrypoint.sh",
  'docker compose -f docker-compose.prod.yml --env-file .env build backend',
  'docker compose -f docker-compose.prod.yml --env-file .env up -d postgres backend',
  'sleep 35',
  'docker compose -f docker-compose.prod.yml ps',
  'curl -fsS http://localhost:3000/health || docker compose -f docker-compose.prod.yml logs --tail=60 backend',
  'docker compose -f docker-compose.prod.yml --env-file .env up -d frontend',
  'sleep 5',
  'curl -fsS -o /dev/null -w "%{http_code}" http://localhost/',
].join('\n');

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
      await exec(conn, cmd);
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

if (!password) {
  console.error('SSH_PASSWORD required');
  process.exit(1);
}

conn.connect({ host, port: 22, username: 'root', password });
