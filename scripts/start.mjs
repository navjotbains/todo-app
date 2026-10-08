import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const API_HEALTH_URL = 'http://localhost:5225/health';
const children = [];

function run(name, color, command, cwd) {
  const child = spawn(command, { cwd, shell: true });
  const prefix = `\x1b[${color}m[${name}]\x1b[0m `;
  const forward = output => data => {
    for (const line of data.toString().split(/\r?\n/)) {
      if (line) {
        output.write(prefix + line + '\n');
      }
    }
  };
  child.stdout.on('data', forward(process.stdout));
  child.stderr.on('data', forward(process.stderr));
  child.on('exit', code => {
    if (code) {
      stopAll(code);
    }
  });
  children.push(child);
}

function stopAll(code = 0) {
  for (const child of children) {
    child.kill();
  }
  process.exit(code);
}

function installFrontend() {
  return new Promise((resolve, reject) => {
    const install = spawn('npm install', { cwd: 'frontend', shell: true, stdio: 'inherit' });
    install.on('exit', code => (code === 0 ? resolve() : reject(new Error('Frontend install failed'))));
  });
}

async function waitForApi(timeoutMs = 60_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(API_HEALTH_URL);
      if (response.ok) {
        return;
      }
    } catch {
      // The API isn't listening yet; try again shortly.
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`The API did not start within ${timeoutMs / 1000} seconds.`);
}

process.on('SIGINT', () => stopAll());

if (!existsSync('frontend/node_modules')) {
  console.log('Installing frontend packages (first run only)...');
  await installFrontend();
}

run('api', 36, 'dotnet run --project backend/src/TodoApp.Api', '.');
await waitForApi();
run('web', 35, 'npm start', 'frontend');