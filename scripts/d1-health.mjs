import { spawn } from 'node:child_process';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const run = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: false, ...options });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });
  });

const startServer = () => {
  const child = spawn(
    'npx',
    ['wrangler', 'dev', 'src/worker.ts', '--local', '--port', '8787', '--log-level', 'error'],
    { stdio: 'inherit', shell: false }
  );
  return child;
};

const checkHealth = async () => {
  const response = await fetch('http://127.0.0.1:8787/api/health/d1');
  const body = await response.json();

  if (!response.ok || body.ok !== true) {
    throw new Error(`D1 health check failed: ${JSON.stringify(body)}`);
  }

  return body;
};

const main = async () => {
  await run('npx', ['wrangler', 'd1', 'migrations', 'apply', 'hub-health', '--local']);

  const server = startServer();

  try {
    let attempts = 0;
    while (attempts < 20) {
      try {
        await checkHealth();
        console.log('D1 health check passed.');
        return;
      } catch (error) {
        attempts += 1;
        if (attempts >= 20) {
          throw error;
        }
        await wait(500);
      }
    }
  } finally {
    server.kill('SIGTERM');
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
