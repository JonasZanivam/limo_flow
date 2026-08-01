#!/usr/bin/env node
import { Client } from 'ssh2';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const host = process.env.SSH_HOST ?? '145.223.31.172';
const password = process.env.SSH_PASSWORD;
const pubKey = readFileSync(
  resolve(process.env.USERPROFILE ?? '', '.ssh/limoflow_vps_deploy.pub'),
  'utf8',
).trim();

const cmd = [
  'mkdir -p ~/.ssh',
  'chmod 700 ~/.ssh',
  `grep -qxF '${pubKey}' ~/.ssh/authorized_keys 2>/dev/null || echo '${pubKey}' >> ~/.ssh/authorized_keys`,
  'chmod 600 ~/.ssh/authorized_keys',
  'echo deploy-key-configured',
].join(' && ');

const conn = new Client();
conn
  .on('ready', () => {
    conn.exec(cmd, (err, stream) => {
      if (err) throw err;
      stream.on('data', (d) => process.stdout.write(d));
      stream.on('close', () => conn.end());
    });
  })
  .connect({ host, port: 22, username: 'root', password });
