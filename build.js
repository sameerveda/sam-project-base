const { esbuild_start, startServeHttp } = require('sam-project-base/esbuild-init');

const dev = process.argv.includes('--dev');

esbuild_start(dev).then(() => dev && startServeHttp());
