const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = function override(config, env) {
    config.plugins.push(
        new MonacoWebpackPlugin({languages: ['java', 'javascript', 'xml', 'html', 'yaml']})
    );
    console.log('-> Configuration overrides');
    return config;
}