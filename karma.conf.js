module.exports = function (config) {
    config.set({
        frameworks: ['jasmine'],
        files: ['test/spec/analysis/**/*.js'],
        reporters: ['progress'],
        port: 9876,  // karma web server port
        colors: true,
        logLevel: config.LOG_INFO,
        browsers: ['ChromeHeadless'],
        autoWatch: false,
        // singleRun: false, // Karma captures browsers, runs the tests and exits
        concurrency: Infinity,
        preprocessors: {
            'test/spec/analysis/**/*.js': ['webpack'],
        },
        webpack: {
            // output: {
            //     // Library name when loading the library on a browser (leaflet: L, jquery: $)
            //     library: "carto",
            //     // The bundle will be compiled in UMD.
            //     libraryTarget: "umd",
            // },
            // // Tell webpack to generate sourcemaps for easy-degug
            // devtool: 'source-map',
            module: {
                // Required for loading the templates
                loaders: [
                    { test: /\.tpl$/, loader: "underscore-template-loader" }
                ]
            },
            node: {
                fs: "empty",
                path: "empty",
            }
        },
        webpackMiddleware: {
            // Any custom webpack-dev-middleware configuration...
        }
    });
};