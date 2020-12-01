const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WriteAssetsWebpackPlugin = require('write-assets-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const production = process.env.NODE_ENV === 'production';


const clientConfig = {
	context: path.resolve(__dirname, 'src', 'client'),
	entry: {
		collection: ['./controllers/collection/collection'],
		'collection/create': ['./controllers/collection/userCollectionForm'],
		collections: ['./controllers/collections'],
		deletion: ['./controllers/deletion.js'],
		error: ['./controllers/error.js'],
		index: ['./controllers/index.js'],
		registrationDetails: ['./controllers/registrationDetails.js'],
		revision: ['./controllers/revision.js'],
		revisions: ['./controllers/revisions.js'],
		search: ['./controllers/search.js'],
		statistics: ['./controllers/statistics.js'],
		'editor/achievement': ['./controllers/editor/achievement.js'],
		'editor/edit': ['./controllers/editor/edit.js'],
		'editor/editor': ['./controllers/editor/editor.js'],
		'entity/entity': ['./controllers/entity/entity.js'],
		'entity-editor': ['./entity-editor/controller.js'],
		'entity-merge': ['./entity-editor/entity-merge.tsx'],
		style: './stylesheets/style.less'
	},
	output: {
		/** Figure out how to use manifest to load the right chunkNamed file in src/server/templates/target.js */
		// chunkFilename: production ? 'js/[name].[chunkhash].js' : 'js/[name].js',
		// filename: production ? 'js/[name].[chunkhash].js' : 'js/[name].js',
		filename: 'js/[name].js',
		path: path.resolve(__dirname, 'static'),
		publicPath: '/static/',
		hotUpdateChunkFilename: 'hot/[id].[hash].hot-update.js',
    	hotUpdateMainFilename: 'hot/[hash].hot-update.json'
	},
	mode: production ? 'production' : 'development',
	module: {
		rules: [
			{
				// babel configuration in .babelrc file
				exclude: /node_modules/,
				test: /\.(js|jsx|ts|tsx)$/,
				use: ['babel-loader']
			},
			{
				test: /\.(le|c)ss$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							importLoaders: 2,
							sourceMap: !production
						}
					},
					'resolve-url-loader',
					{
						loader: 'less-loader',
						options: {
							paths: [path.resolve(__dirname, 'node_modules', 'bootstrap', 'less')],
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
						emitFile: false,
						name: '[name].[ext]',
						outputPath: 'webfonts/',
					}
				}]
			},
			{
				test: /\.(jpg|jpeg|png|gif|svg)$/,
				use: [{
					loader: 'file-loader',
					options: {
						emitFile: false,
						name: '[name].[ext]',
						outputPath: 'images/',
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
			// chunkFilename: 'stylesheets/[id].css',
			filename: 'stylesheets/style.css'
		}),
		new CleanWebpackPlugin(
			[
				'static/js',
				'static/stylesheets',
				// Clean up hot-update files that are created by react-hot-loader and written to disk by WriteAssetsWebpackPlugin
				// Working on a way for WriteAssetsWebpackPlugin to ignore .hot-update.js files but no luck so far.
				'static/hot'
			],
			{exclude:[".keep"]}
		),
		// Because of server-side rendering and the absence of a static html file we could modify with HtmlWebpackPlugin,
		// we need the js files to exist on disk
		new WriteAssetsWebpackPlugin({
			extension: ['js', 'css'],
			force: true
		}),
		new ESLintPlugin({
			extensions: ['.js', '.jsx', '.ts', '.tsx'],
			fix: !production
		})
	],
	resolve: {
		extensions: ['.js', '.jsx', '.ts', '.tsx']
	},
	target: 'web'
}


if (production) {
	clientConfig.plugins.push(new CompressionPlugin());
}
if (!production) {
	clientConfig.plugins = [
		...clientConfig.plugins,
		new webpack.NamedModulesPlugin(),
		new webpack.HotModuleReplacementPlugin()
	]

	if (process.env.BUNDLE_ANALYZER) {
		clientConfig.plugins.push(new BundleAnalyzerPlugin());
	}

	/* Add webpack HMR middleware to all entry files except for styles */
	for (const entry in clientConfig.entry) {
		if (Object.prototype.hasOwnProperty.call(clientConfig.entry, entry)) {
			if(entry !== "style"){
				clientConfig.entry[entry].push('webpack-hot-middleware/client');
			}
		}
	}
	clientConfig.devtool = 'inline-source-map';
}


module.exports = clientConfig;
