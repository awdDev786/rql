
/*
    ./webpack.config.js
*/
const path = require('path');
var debug = process.env.NODE_ENV !== "production";
 var webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
  
  entry: {
    angular: './Client/sdk/app.js',
    rql:'./Client/sdk/temp.js'
  },
  output: {
   path: path.join(__dirname, "./Client/sdk/dist"),
    filename: "[name].bundle.js",
    chunkFilename: "[id].chunk.js"
  },
  /*module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ }
    ]
  }*/
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: [{
          loader: 'babel-loader',
          options: { presets: ['es2015'] },
        }],
      },
    
      // Loaders for other file types can go here
    ],
  },
  plugins: [
    new UglifyJSPlugin(),
     new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
  })
  ],
  externals: {
    'jquery': 'jQuery',
    'angular': 'angular'
}
}