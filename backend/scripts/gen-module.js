#!/usr/bin/env node

const { spawnSync } = require('node:child_process');

const inputName = process.argv[2];

if (!inputName) {
  console.error('Usage: npm run gen:module -- <module-name> [route]');
  process.exit(1);
}

const name = inputName.trim().toLowerCase();
const routeArg = process.argv[3];
const route =
  routeArg && routeArg.trim().length > 0
    ? routeArg.trim().toLowerCase()
    : `${name}${name.endsWith('s') ? '' : 's'}`;

const result = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['hygen', 'module', 'new', '--name', name, '--route', route],
  { stdio: 'inherit', shell: process.platform === 'win32' }
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
