var path = require('path');
var webpack = require('webpack');
var relativeToRootPath = ".";
var f2eci = require("./f2eci");
var env = f2eci.env;
var WebpackShellPlugin = require('webpack-shell-plugin');
module.exports = {
  entry: {
    'test': ['./test/src/index.js']
  },
  output: {
    path: path.resolve(__dirname, './test/dist'),
    publicPath: env == 'alpha' ? './' : f2eci["urlPrefix"],
    chunkFilename: '[name].[chunkhash].js',
    filename: 'build.js'
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules'),
  },
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      { test: /\.styl$/, loader: 'style-loader!css-loader!stylus-loader' },
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules\/(?!@gfe)/
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.html$/,
        loader: 'vue-html'
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg|ttc|TTF)([\?]?.*)$/,
        loader: "file"
      },
      {
          test: /\.woff|ttf|woff2|eot$/,
          loader: 'url-loader?limit=1000&name=font-[hash:6].[ext]'
      },
      {
          test: /\.less$/,
          loader: env == "alpha" ? "style!css!postcss!less" : ExtractTextPlugin.extract('css!postcss!less')
      },
      {
          test: /\.css$/,
          loader: env == "alpha" ? "style!css!postcss!less" : ExtractTextPlugin.extract('css!postcss!less')
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: ["url?limit=1000"]
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.common.js'
    }
  },
  plugins: [
    new WebpackShellPlugin({onBuildStart: ['gulp']}),
    new webpack.DefinePlugin({
        COMPONENT_NAME: JSON.stringify(require('./package.json').name)
    })
  ],
  devServer: {
    historyApiFallback: false,
    noInfo: true,
    hot: true,
    contentBase: f2eci.output,
    disableHostCheck: true,
    publicPath: '/',
    stats:{
      colors: true
    }
  },
  devtool: '#source-map'
}
