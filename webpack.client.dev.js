const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

let pluginsArray = [
	new CleanWebpackPlugin(['static/js'])
];
if (process.env.BUNDLE_ANALYZER) {
	pluginsArray.push(new BundleAnalyzerPlugin());
}

module.exports = {
	context: path.resolve(__dirname, 'src', 'client/'),
	entry: {
		'index': './controllers/index.js',
		'deletion': './controllers/deletion.js',
		'registrationDetails': './controllers/registrationDetails.js',
		'revision': './controllers/revision.js',
		'search': './controllers/search.js',
		'statistics': './controllers/statistics.js',
		// editor: [
		// 	'./controllers/editor/achievement.js',
		// 	'./controllers/editor/edit.js',
		// 	'./controllers/editor/editor.js'
		// ],
		'editor/achievement': './controllers/editor/achievement.js',
		'editor/edit': './controllers/editor/edit.js',
		'editor/editor': './controllers/editor/editor.js',
		'entity/entity': './controllers/entity/entity.js'
	},
	mode: 'development',
	module: {
		rules: [
			{
				enforce: 'pre',
				exclude: /node_modules/,
				test: /\.(js|jsx)$/,
				use: 'eslint-loader'
			},
			{
				exclude: /node_modules/,
				test: /\.js$/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							'flow',
							'react',
							['env', {
								targets: {
									node: 'current'
								}
							}]
						]
					}
				}
			}

			/* ,
			{
				test: /\.less$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'less-loader'
				]
			}*/
		]
	},
	// Create a bundle.js with all common node_modules dependencies
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
	output: {
		filename: '[name].js',
		// filename: '[name].[chunkhash:8].js',
		path: path.resolve(__dirname, 'static', 'js'),
		publicPath: '/static/'
	},
	plugins: pluginsArray
};
