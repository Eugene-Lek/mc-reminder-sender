module.exports = {
  webpack: (config) =>
    Object.assign(config, {
      entry: {
        background: './main/background.js',
        preload: './main/preload.js',
      },
    }),
};