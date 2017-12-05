'use strict';

var basePath = "/new/";

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    devtool: 'eval-source-map',
    entry: [
        'babel-polyfill',
        'webpack-dev-server/client?http://localhost:3000/',
        'webpack/hot/only-dev-server',
        'react-hot-loader/patch',
        path.join(__dirname, 'src/client2/index.js')
    ],
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        hot: true,
        port: 3000,
        publicPath: 'http://localhost:3000/new/',
    },
    output: {
        path: path.join(__dirname, '/dist/'),
        filename: '[name].js',
        publicPath: basePath
    },
    plugins: [
        new HtmlWebpackPlugin({
          template: 'src/client2/index.tpl.html',
          inject: 'body',
          filename: 'index.html'
        }),
        new ExtractTextPlugin('[name].min.css'),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('development')
        })
    ],
    module: {
        preLoaders: [
        ],
        loaders: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: 'babel'
            },
            {
                test: /\.json?$/,
                loader: 'json'
            },
            {
                test: /\.(jpg|png)$/,
                loader: 'url-loader',
                options: {
                  limit: 25000,
                },
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('style', 'css!sass')
            },
            { test: /\.woff(2)?(\?[a-z0-9#=&.]+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
            { test: /\.(ttf|eot|svg)(\?[a-z0-9#=&.]+)?$/, loader: 'file' }
        ]
    }
};
