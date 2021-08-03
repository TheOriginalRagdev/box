var path = require("path");
const webpack = require("webpack");
var buildPath = path.resolve("src");

module.exports = (env) => ({
  mode: env && env.prod ? "production" : "development",

  plugins: [
    new webpack.ProvidePlugin({
      box: "box",
      loader: "loader",
    }),
  ],

  entry: ["./src/client.js"],
  output: {
    path: buildPath,
    filename: "client.js",
  },

  resolve: {
    alias: {
      "@socket.io": path.resolve("node_modules/@socket.io"),
      box: path.resolve(__dirname, "core/box"),
      loader: path.resolve(__dirname, "core/loader"),
    },
  },

  performance: {
    // change the default size warnings
    maxEntrypointSize: 1.5e6,
    maxAssetSize: 1.5e6,
  },

  stats: {
    modules: false,
  },
  devtool: "source-map",
  devServer: {
    contentBase: buildPath,
    inline: true,
    host: "127.0.0.1",
    stats: "minimal",
  },
  // optimising build CPU and DEV server
  watchOptions: {
    aggregateTimeout: 500,
    poll: 1000,
    ignored: ["node_modules"],
  },
  // split out babylon to a separate bundle
  optimization: {
    splitChunks: {
      cacheGroups: {
        babylon: {
          chunks: "initial",
          test: /socket.io/,
          filename: "socket.io.js",
        },
      },
    },
  },
});
