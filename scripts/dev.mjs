import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const children = [];
let closing = false;

function shutdown(code) {
  if (closing) return;
  closing = true;
  for (const child of children) {
    if (!child.killed) {
      try {
        child.kill('SIGTERM');
      } catch {
        /* abaikan */
      }
    }
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log('[dev] Memulakan Vite dev server ...');

const web = spawn(process.execPath, ['node_modules/vite/bin/vite.js'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

web.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`[dev] Vite berhenti dengan kod ${code}.`);
  }
  shutdown(code ?? 0);
});

children.push(web);

const api = spawn(process.execPath, ['server/index.js'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});
api.on('exit', (code) => shutdown(code ?? 0));
children.push(api);
