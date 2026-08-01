#!/usr/bin/env node
import { Client } from 'ssh2';

const host = process.env.SSH_HOST ?? '145.223.31.172';
const password = process.env.SSH_PASSWORD;

const cmd = [
  'cd /opt/limoflow',
  'grep -E "^(SEED_ADMIN_PASSWORD|RUN_SEED|FRONTEND_URL)=" .env',
  "sed -i 's/^RUN_SEED=true/RUN_SEED=false/' .env",
  'grep RUN_SEED .env',
  'docker compose -f docker-compose.prod.yml ps',
].join('\n');

const conn = new Client();
conn
  .on('ready', () => {
    conn.exec(cmd, (err, stream) => {
      if (err) throw err;
      stream.on('data', (d) => process.stdout.write(d));
      stream.stderr.on('data', (d) => process.stderr.write(d));
      stream.on('close', () => conn.end());
    });
  })
  .on('error', (err) => {
    console.error(err.message);
    process.exit(1);
  })
  .connect({ host, port: 22, username: 'root', password });
