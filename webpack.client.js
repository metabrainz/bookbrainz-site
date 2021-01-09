const path = require('path');
const webpack = require('webpack');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const production = process.env.NODE_ENV === 'production';

const cleanWebpackPluginOpts = {
	cleanOnceBeforeBuildPatterns: [
		'js/**/*',
		'stylesheets',
		// Clean up hot-update files that are created by react-hot-loader and written to disk by WriteAssetsWebpackPlugin
		// Working on a way for WriteAssetsWebpackPlugin to ignore .hot-update.js files but no luck so far.
		'hot',
		'!**/.keep'
	]
};


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
		publicPath: '/'
	},
	mode: production ? 'production' : 'development',
	module: {
		rules: [
			{
				include: /node_modules/,
				test: /\.(js|mjs)$/,
				resolve: {
					fullySpecified: false
				}
			},
			{
				// babel configuration in .babelrc file
				include: path.resolve(__dirname, 'src'),
				test: /\.(js|jsx|ts|tsx)$/,
				use: ['babel-loader']
			},
			{
				test: /\.(le|c)ss$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					{
						loader: 'less-loader',
						options: {
							lessOptions: {
								math: 'always',
								paths: [path.resolve(__dirname, 'node_modules', 'bootstrap', 'less')]
							}
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
				type: 'asset/resource',
				generator: {
					filename: 'images/[name][ext][query]'
				}
			}
		]
	},
	optimization: {
		splitChunks: {
			chunks: 'all',
			name: 'bundle'
		}
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'stylesheets/[name].css'
		}),
		new CleanWebpackPlugin(cleanWebpackPluginOpts),
		new ESLintPlugin({
			extensions: ['.js', '.jsx', '.ts', '.tsx'],
			files: path.resolve(__dirname, 'src'),
			fix: !production,
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
