const { esbuild_start, startServeHttp, postcssPlugin } = require('sam-project-base/esbuild-init');

const dev = process.argv.includes('--dev');

esbuild_start(dev, { plugins: [postcssPlugin()] }).then(() => dev && startServeHttp());
