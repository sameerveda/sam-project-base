#!/usr/bin/env node

const { existsSync } = require('fs');
const { copyFile, unlink, mkdir, readdir } = require('fs/promises');
const installPackages = require('install-packages');
const { join } = require('path');
const prompts = require('prompts');

const argv = process.argv;
const INIT_BUILD = 'init-build';
const INIT_SVELTE = 'init-svelte';
const INIT_ALPINE = 'init-alpine';

if (argv.includes('-v')) return console.log(require('./package.json').version);
if (argv.includes('-h'))
  return console.table([
    ['-v', 'show version'],
    ['-h', 'show help text'],
    ['--yes', 'yes to all replace prompts'],
    [INIT_BUILD, 'create base build file'],
    [INIT_SVELTE, 'setup svelte project'],
    [INIT_ALPINE, 'setup alpinejs project'],
  ]);

async function replace(src, target) {
  const copy = async () => {
    await copyFile(join(__dirname, src), target);
    console.log('created: ' + target);
  };

  if (!existsSync(target)) {
    await copy();
    return true;
  }

  if (
    argv.includes('--yes') ||
    (
      await prompts({
        type: 'confirm',
        name: 'value',
        message: 'Sure to replace existing file: ' + target + '?',
        initial: true,
      })
    ).value
  ) {
    await unlink(target);
    await copy();
    return true;
  }

  return false;
}

async function mkdirs() {
  await mkdir('src', { recursive: true });
  await mkdir('public', { recursive: true });
}

async function moveAll(src) {
  await mkdirs();

  for (const f of await readdir(join(__dirname, src))) {
    await replace(join(src, f), join(f.endsWith('.html') ? 'public' : 'src', f));
  }
}

const initBuild = () => replace('build.js', 'build.js');

(async () => {
  if (argv.includes(INIT_BUILD)) {
    await initBuild();
  }

  if (argv.includes('init-svelte')) {
    await replace('build-svelte.js', 'build.js');
    await replace('svelte.config.js', 'svelte.config.js');

    moveAll('svelte');

    await installPackages({
      packages: ['basscss', 'esbuild-svelte', 'lodash-es', 'postcss', 'postcss-nested', 'svelte'],
    });
  }

  if (argv.includes(INIT_ALPINE)) {
    await initBuild();
    await moveAll('alpine');

    await installPackages({
      packages: ['basscss', 'lodash-es', 'postcss', 'postcss-nested', 'alpinejs'],
    });
  }
})();
