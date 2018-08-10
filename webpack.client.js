/* eslint import/no-commonjs: 0, 
	import/unambiguous: 0,
	import/no-commonjs: 0
*/
const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WriteAssetsWebpackPlugin = require('write-assets-webpack-plugin');


const production = process.env.NODE_ENV === 'production';


let config = {
	context: path.resolve(__dirname, 'src', 'client'),
	entry: {
		deletion: ['./controllers/deletion.js'],
		index: ['./controllers/index.js'],
		registrationDetails: ['./controllers/registrationDetails.js'],
		revision: ['./controllers/revision.js'],
		search: ['./controllers/search.js'],
		statistics: ['./controllers/statistics.js'],
		'editor/achievement': ['./controllers/editor/achievement.js'],
		'editor/edit': ['./controllers/editor/edit.js'],
		'editor/editor': ['./controllers/editor/editor.js'],
		'entity/entity': ['./controllers/entity/entity.js']
	},
	output: {
		chunkFilename: production ? 'js/[name].[chunkhash].js' : 'js/[name].js',
		filename: production ? 'js/[name].[chunkhash].js' : 'js/[name].js',
		path: path.resolve(__dirname, 'static'),
		publicPath: '/static'
	},
	mode: production ? 'production' : 'development',
	module: {
		rules: [
			{
				enforce: 'pre',
				exclude: /node_modules/,
				test: /\.(js|jsx)$/,
				use: {
					loader: 'eslint-loader',
					options: {
						cache: !production,
						fix: !production
					}
				}
			},
			{
				exclude: /node_modules/,
				test: /\.(js|jsx)$/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							'flow',
							'react',
							'react-hmre',
							['env', {
								targets: {
									node: 'current'
								}
							}]
						],
						plugins: ['react-hot-loader/babel']
					}
				}
			},
			{
				test: /\.(le|c)ss$/,
				use: [
					{
						loader: !production ? 'style-loader' : MiniCssExtractPlugin.loader
					},
					{
						loader: 'css-loader',
						options: {
							importLoaders: 1,
							sourceMap: !production
						}
					},
					{
						loader: 'less-loader',
						options: {
							sourceMap: !production
						}
					}
				]
			},
			{
				test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
				use: [{
					loader: 'file-loader',
					options: {
						name: '[name].[ext]',
						outputPath: 'fonts/'
					}
				}]
			},
			{
				test: /\.(jpg|jpeg|png|gif|svg)$/,
				use: [{
					loader: 'file-loader',
					options: {
						name: '[name].[ext]',
						outputPath: 'images/',
						paths: [
							path.resolve(__dirname, 'src', 'stylesheets')
						]
					}
				}]
			}
		]
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				commons: {
					chunks: 'all',
					name: 'bundle',
					test: /[\\/]node_modules[\\/]/
				}
			}
		}
	},
	plugins:[
		new MiniCssExtractPlugin({
			chunkFilename: 'stylesheets/[id].css',
			filename: 'stylesheets/[name].css'
		})
	]
}


if (production) {
	config.plugins = [
		...config.plugins,
		new CleanWebpackPlugin(['static/js', 'static/stylesheets'])
	];
}
else {
	config.plugins = [
		...config.plugins,
		new webpack.NamedModulesPlugin(),
		new webpack.HotModuleReplacementPlugin()
		// Because of server-side rendering, we want the physical files to exist on disk
		// ,
		// new WriteAssetsWebpackPlugin({ force: true, extension: ['js'] })
	]

	if (process.env.BUNDLE_ANALYZER) {
		config.plugins.push(new BundleAnalyzerPlugin());
	}

	for (const entry in config.entry) {
		if (Object.prototype.hasOwnProperty.call(config.entry, entry)) {
			config.entry[entry].push('webpack-hot-middleware/client');
		}
	}
	config.devtool = 'inline-source-map';
}


module.exports = config;
