const {
  esbuild_start,
  startServeHttp,
  sveltePlugin,
  postcssPlugin,
} = require('sam-project-base/esbuild-init');

const dev = process.argv.includes('--dev');

esbuild_start(dev, {
  plugins: [postcssPlugin(), sveltePlugin()],
}).then(() => dev && startServeHttp());
