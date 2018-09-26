module.exports = {
    devtool: 'source-map',
    plugins: [
        // your custom plugins
    ],
    module: {
        rules: [
            {
                test: /\.worker\.js$/,
                use: { loader: 'worker-loader' }
            }
        ]
    }
};
