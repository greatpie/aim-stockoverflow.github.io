var path = require('path');
var mod = process.env.NODE_ENV || 'development';
console.log(mod);

var isDebug = (mod === 'development');
console.log('isDebug: ', isDebug);

/**
 * webpack Entry
 */
var entry = {
	index: './dev/app/index.js',
  vendors: [
    'react', 'react-dom', 'react-router', 'antd',
    './dev/app/css/antd.css'
  ]
};

/**
 * 独立页面注入
 */
var templates = [
	{
		chunks: ['vendors', 'index'],
		template: './dev/app/templates/index.html',  // 入口
		filename: './static/index.html'  // 出口
	}
];

/**
 * output
 */
var output = {
	path: './static/',
	publicPath: '/static/',
	filename: isDebug ? 'js/[name].js' : 'js/[name].js?[hash:8]',
  chunkFilename: isDebug ? 'js/[chunkhash:8].chunk.js' : 'js/[name].chunk.js?[chunkhash:8]'
};

/**
 * plugins
 */
var webpack = require('webpack');

var UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var cssFile = isDebug ? 'css/[name].css' : 'css/[name].css?[contenthash:8]';

var plugins = [
  new webpack.DefinePlugin({
    __ENV__: `"${mod.toString()}"`
  }),
  new CommonsChunkPlugin({
    name: 'vendors',
    filename: isDebug ? 'js/vendors.js' : 'js/vendors.js?[chunkhash:8]'
  }),
  new ExtractTextPlugin(cssFile),
];

if (!isDebug) {
  var uglifyJS = new UglifyJsPlugin({
    compress: {
      warnings: false
    },
    except: ['$super', '$', 'exports', 'require']
  });
  plugins.push(uglifyJS);
};

templates.forEach((o) => {
	const template = o.template;
	const filename = o.filename;
	const params = {
		chunks: o.chunks,
		template: `!raw!./${template}`,
		filename: filename,
		inject: true,
		minify: {
			removeComments: true
		}
	};
	plugins.push(new HtmlWebpackPlugin(params));
});

/**
 * alias资源别名
 */
var alias = {
  data: path.join(__dirname, './dev', 'data')
};

var config = {
  entry: entry,

  output: output,

  devtool: isDebug ? '#source-map' : '#cheap-module-source-map',

  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    color: true,
    progress: true,
    contentBase: './static',
    host: '127.0.0.1',
    port: 3010
  },

  plugins: plugins,

  resolve: {
    extensions: ['', '.coffee', '.js', '.jsx', '.json'],
    alias: alias
  },

  module: {
    loaders: [
      {
        test: /\.js[x]?$/,
        exclude: /node_modules/,
        loader: 'react-hot!babel-loader?presets[]=es2015&presets[]=react'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.less$/,
        exclude: /node_modules/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader')
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
      },
      {
        test: /\.(jpeg|jpg|png|gif)$/,
        loader: 'url?limit=8192&name=images/[name].[hash:8].[ext]'
      },
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/font-woff2'
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/octet-stream'
      },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=image/svg+xml'
      }
    ]
  }
};

module.exports = config;
