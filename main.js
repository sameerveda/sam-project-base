#!/usr/bin/env node

const { existsSync } = require('fs');
const { copyFile, unlink, mkdir, readdir } = require('fs/promises');
const installPackages = require('install-packages');
const { join } = require('path');
const prompts = require('prompts');

const argv = process.argv;

if (argv.includes('-v')) return console.log(require('./package.json').version);
if (argv.includes('-h'))
  return console.table([
    ['-v', 'show version'],
    ['-h', 'show help text'],
    ['init-build', 'create base build file'],
    ['init-svelte', 'setup svelte project'],
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

(async () => {
  if (argv.includes('init-build')) {
    await replace('build.js', 'build.js');
  }

  if (argv.includes('init-svelte')) {
    await replace('build-svelte.js', 'build.js');
    await replace('svelte.config.js', 'svelte.config.js');
    await mkdirs();

    for (const f of await readdir(join(__dirname, 'svelte'))) {
      f !== 'index.html' && (await replace('svelte/' + f, 'src/' + f));
    }

    await replace('svelte/index.html', 'public/index.html');

    await installPackages({
      packages: ['basscss', 'esbuild-svelte', 'lodash-es', 'postcss', 'postcss-nested', 'svelte'],
    });
  }
})();
