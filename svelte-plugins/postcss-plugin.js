const postcss = require('postcss');

module.exports = (plugins = [require('postcss-nested')]) => ({
  style: ({ content }) =>
    postcss(plugins)
      .process(content, { from: undefined })
      .then(({ css, map }) => ({ code: css, map: map?.toString() })),
});
