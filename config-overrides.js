const webpack = require('webpack');

module.exports = function override(config, env) {
  // Add fallbacks for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer"),
    "util": require.resolve("util"),
    "assert": require.resolve("assert"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "url": require.resolve("url"),
    "fs": false,
    "path": require.resolve("path-browserify"),
    "net": false,
    "tls": false,
    "vm": false, // Disable vm module to prevent conflicts
    "zlib": false, // Disable zlib to prevent Metaplex conflicts
    "process/browser": require.resolve("process/browser")
  };

  // Add plugins for polyfills
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
  ];

  // Handle window object conflicts with browser extensions
  config.optimization = {
    ...config.optimization,
    nodeEnv: false,
  };

  // Add ignore warnings for source maps
  config.ignoreWarnings = [
    /Failed to parse source map/,
    /Module Warning \(from .*source-map-loader/,
  ];

  return config;
};
