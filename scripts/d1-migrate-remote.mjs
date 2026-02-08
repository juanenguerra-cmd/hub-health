import { spawn } from 'node:child_process';

const runInherit = (command, args, options = {}) =>
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

const runWithOutput = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'], shell: false, ...options });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}\n${stderr}`));
      }
    });
  });

const verifyRemote = async () => {
  const { stdout } = await runWithOutput('npx', [
    'wrangler',
    'd1',
    'execute',
    'hub-health',
    '--remote',
    '--command',
    "SELECT name FROM sqlite_master WHERE type='table' AND name='__sync_probe';",
    '--json',
  ]);

  let parsed;
  try {
    parsed = JSON.parse(stdout.trim());
  } catch (error) {
    throw new Error(`Failed to parse D1 verification output: ${error.message}`);
  }

  if (Array.isArray(parsed?.errors) && parsed.errors.length > 0) {
    throw new Error(`Remote D1 verification returned errors: ${JSON.stringify(parsed.errors)}`);
  }

  const results = parsed?.results ?? parsed?.result ?? [];
  const hasTable = Array.isArray(results)
    ? results.some((row) => row?.name === '__sync_probe' || row?.NAME === '__sync_probe')
    : false;

  if (!hasTable) {
    throw new Error('Remote D1 verification failed: __sync_probe table not found.');
  }

  console.log('Remote D1 verification passed.');
};

const main = async () => {
  console.log('Applying remote D1 migrations...');
  await runInherit('npx', ['wrangler', 'd1', 'migrations', 'apply', 'hub-health', '--remote']);
  await verifyRemote();
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
