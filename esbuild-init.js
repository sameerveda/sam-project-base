const { existsSync } = require('fs');
const { resolve } = require('path');
const esbuild = require('esbuild');

const esbuild_default_loaders = {
  '.html': 'text',
  '.png': 'dataurl',
  '.woff': 'file',
  '.woff2': 'file',
  '.eot': 'file',
  '.ttf': 'file',
  '.svg': 'file',
};

const postcssPlugin = (...args) => require('./esbuild/postcss-plugin')(...args);
const svgToSvelteLoaderPlugin = (...args) => require('./esbuild/svg-to-svelte-loader')(...args);

const sveltePlugin = (...args) =>
  require('esbuild-svelte')(...(args.length === 0 ? [require('./svelte.config.js')] : args));

/**
 * @param {import('serve-http').ServerConfig} config
 */
const startServeHttp = (config = {}) => {
  config = {
    port: 3000,
    quiet: true,
    pubdir: require('path').resolve('./public'),
    ...config,
  };
  const server = require('serve-http').createServer(config);
  console.info('server started at http://localhost:' + config.port);

  return server;
};

/**
 * @param {Parameters<import('esbuild').build>[0]} config
 * @returns
 */
const esbuildDefaultConfig = (isDev = false, config = {}) => {
  if (!config.entryPoints) {
    const files = ['./src/app.js', './src/main.js', './src/index.js'].flatMap(t => [
      t,
      t.replace('.js', '.ts'),
    ]);

    config.entryPoints = files.find(existsSync);
    if (!config.entryPoints)
      throw new Error('entryPoints not found, checked: ' + JSON.stringify(files));

    config.entryPoints = [config.entryPoints];
  }

  if (!config.outdir) config.outdir = isDev ? 'public/build' : 'dist';
  config.plugins = config.plugins || [];

  console.log({
    entryPoints: config.entryPoints,
    outdir: config.outdir,
    isDev,
    // Nullish coalescing wont work here, since watch is allowed to override even if watch = null .
    watch: 'watch' in config ? config.watch : isDev,
  });

  return {
    bundle: true,
    logLevel: 'debug',
    loader: esbuild_default_loaders,
    minify: !isDev,
    ...config,
  };
};

/**
 * @param {boolean | 'w' | 's' | 'ws' | 'sw'} isDev
 * @param {Parameters<import('esbuild').build>[0]} config
 * @returns
 */
async function esbuild_start(isDev, config, port = 3000) {
  config = esbuildDefaultConfig(isDev, config);

  if (!isDev) return esbuild.build(config);
  else {
    const mode = typeof isDev === 'boolean' ? 'ws' : isDev;
    const ctx = await esbuild.context(config);
    mode.includes('w') && (await ctx.watch());

    mode.includes('w') &&
      mode.includes('s') &&
      console.log(
        'for live reload include script: \n  ',
        `new EventSource('/esbuild').addEventListener('change', () => location.reload())`
      );

    mode.includes('s') &&
      ctx.serve({
        servedir: 'public',
        port,
      });

    return ctx;
  }
}

module.exports = {
  esbuild_start,
  esbuild_default_loaders,
  postcssPlugin,
  svgToSvelteLoaderPlugin,
  sveltePlugin,
  startServeHttp,
  esbuildDefaultConfig,
};
