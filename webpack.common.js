const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        import: { import: './src/index.ts', filename: 'import.js'},
        export: { import: './src/export.ts', filename: 'export.js'}
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        }, ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        modules: [
            path.resolve(__dirname, './src'),
            "node_modules"
        ]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
};