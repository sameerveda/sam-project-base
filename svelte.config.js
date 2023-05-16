const postcssPlugin = require("sam-project-base/svelte/postcss-plugin");

module.exports = {
  preprocess: [postcssPlugin()],
  // compilerOptions: {
    // preserveComments: true,
  // },
  // filterWarnings: ({ code, filename }) => code !== 'css-unused-selector' || !filename.includes('node_modules'),
};
