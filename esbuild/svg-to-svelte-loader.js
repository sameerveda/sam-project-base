const { readFileSync } = require('fs');
const svelte = require('svelte/compiler');

module.exports = () => ({
  name: 'svg-to-svelte-loader',
  setup(build) {
    const cache = {};
    build.onLoad({ filter: /.svg$/, namespace: 'file' }, ({ path }) => {
      if (!cache[path]) {
        cache[path] = svelte.compile(readFileSync(path, 'utf-8'), {
          immutable: true,
          css: false,
          enableSourcemap: false,
          namespace: 'svg',
        }).js.code;
      }

      return {
        contents: cache[path],
        loader: 'js',
      };
    });
  },
});
