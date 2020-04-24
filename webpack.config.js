const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
	entry: './Public/Js/index.jsx',
	output: {
		path: path.join(__dirname, './Public/Dist'),
		filename: 'mopjs.bundle.js',
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: ['babel-loader'],
			},
			{
				test: /\.(png|svg|jpg|gif)$/,
				use: ['file-loader'],
			},
		],
	},
	resolve: {
		extensions: ['*', '.js', '.jsx'],
	},
	// plugins: [new BundleAnalyzerPlugin()],
};