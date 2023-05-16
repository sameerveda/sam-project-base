const { readFileSync, statSync } = require('fs');
const { basename } = require('path');
const postcss = require('postcss');

module.exports = (plugins = [require('postcss-nested')]) => ({
  name: 'postcss-compiler',
  setup(build) {
    const cache = {};

    build.onLoad({ filter: /.\.(scss|postcss)$/, namespace: 'file' }, async ({ path }) => {
      const mtime = statSync(path).mtime.getTime();

      if (mtime !== cache[path]?.mtime) {
        cache[path] = {
          mtime,
          path,
          data: await postcss(plugins)
            .process(readFileSync(path), { from: path })
            .then(({ css }) => css),
        };
      }

      return {
        contents: cache[path].data,
        loader: 'css',
      };
    });
  },
});
