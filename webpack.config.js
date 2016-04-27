var path = require('path');
var webpack = require('webpack');
//var ExtractTextPlugin = require("extract-text-webpack-plugin");

function getEntrySources(sources) {
    if (process.env.NODE_ENV !== 'production') {
    	 
        sources.unshift('webpack-dev-server/client?http://localhost:8080');
        sources.unshift('webpack/hot/only-dev-server');
       	sources.unshift('webpack/hot/dev-server');
    }

    return sources;
}

var config = {
  entry: getEntrySources([path.resolve(__dirname, 'dev_react/dev_react.js')]),
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'dev_react.js'
  },
  //target: 'node-webkit',
  module: {
    loaders: [{
      test: /\.jsx?$/, // 用正则来匹配文件路径，这段意思是匹配 js 或者 jsx
      exclude: /node_modules/,
      loaders: ['react-hot','babel'],
    },{
        test: /\.css$/,
        loaders: ["css-loader"]
    },{
        test: /\.less$/,
        loaders: ["css-loader","less-loader"]
    }],
  },

  plugins:[
    	//new ExtractTextPlugin("css/main.css",{allChunks: true}),
      // new webpack.ProvidePlugin({
      //      $: "jquery",
      //      jQuery: "jquery"
      //  })
   ]
};

module.exports = config;