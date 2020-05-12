module.exports = {
	apps: [
		{
			name: 'MOPJs',
			script: './index.js',
			watch: true,
			env: {
				NODE_ENV: 'production',
			},
		},
	],
};
