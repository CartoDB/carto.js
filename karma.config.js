module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      'test/vendor/underscore.js',
      'vendor/backbone.js',
      'vendor/jquery.min.js',
      'vendor/lzma.js',
      'test/vendor/gmaps.js',
      'test/vendor/tangram.js',
      'node_modules/jasmine-ajax/lib/mock-ajax.js',
      'node_modules/leaflet/dist/leaflet-src.js',
      'test/index.js'
    ],
    preprocessors: { 'test/index.js': ['webpack'] },
    reporters: ['mocha'],
    port: 9876, // karma web server port
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless'],
    autoWatch: true,
    singleRun: false,
    concurrency: Infinity,
    webpack: {
      node: {
        fs: 'empty'
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/
          },
          {
            test: /\.tpl$/,
            loader: 'underscore-template-loader'
          }
        ]
      },
      externals: {
        lzma: 'LZMA'
      }
    }
  });
};
