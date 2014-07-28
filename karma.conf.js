module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    frameworks: ['jasmine', 'sinon'],

    // list of files / patterns to load in the browser
    files: [
      'https://maps.google.com/maps/api/js?sensor=false&v=3.12',

      'vendor/jquery.min.js',
      'vendor/jquery.faviconNotify.js',

      'vendor/underscore-min.js',
      'vendor/backbone.js',
      'vendor/leaflet.js',
      'vendor/wax.cartodb.js',
      'vendor/mustache.js',
      'vendor/GeoJSON.js',
      'vendor/jscrollpane.js',
      'vendor/spin.js',
      'vendor/lzma.js',
      'vendor/mod/carto.js',
      'vendor/mod/torque.uncompressed.js',
      'vendor/mod/jquery-ui/jquery.ui.core.js',
      'vendor/mod/jquery-ui/jquery.ui.widget.js',
      'vendor/mod/jquery-ui/jquery.ui.mouse.js',
      'vendor/mod/jquery-ui/jquery.ui.slider.js',
      
      //<!-- SOURCE -->
      'src/cartodb.js',

      //<!-- Core source -->
      'src/core/decorator.js',
      'src/core/config.js',
      'src/core/log.js',
      'src/core/profiler.js',
      'src/core/template.js',
      'src/core/model.js',
      'src/core/view.js',

      //<!-- Geo source -->
      'src/geo/geometry.js',
      'src/geo/map.js',
      'src/geo/ui/header.js',
      'src/geo/ui/legend.js',
      'src/geo/ui/infobox.js',
      'src/geo/ui/infowindow.js',
      'src/geo/ui/layer_selector.js',
      'src/geo/ui/share.js',
      'src/geo/ui/zoom_info.js',
      'src/geo/ui/tiles_loader.js',
      'src/geo/ui/zoom.js',
      'src/geo/ui/tooltip.js',
      'src/geo/ui/time_slider.js',
      'src/geo/ui/fullscreen.js',

      'src/geo/layer_definition.js',
      'src/geo/common.js',

      'src/geo/leaflet/leaflet.geometry.js',

      'src/geo/leaflet/leaflet_base.js',
      'src/geo/leaflet/leaflet_plainlayer.js',
      'src/geo/leaflet/leaflet_tiledlayer.js',
      'src/geo/leaflet/leaflet_cartodb_layergroup.js',
      'src/geo/leaflet/leaflet_cartodb_layer.js',
      'src/geo/leaflet/torque.js',
      'src/geo/leaflet/leaflet.js',

      'src/geo/gmaps/gmaps.geometry.js',
      'src/geo/gmaps/gmaps_base.js',
      'src/geo/gmaps/gmaps_baselayer.js',
      'src/geo/gmaps/gmaps_plainlayer.js',
      'src/geo/gmaps/gmaps_tiledlayer.js',
      'src/geo/gmaps/gmaps_cartodb_layergroup.js',
      'src/geo/gmaps/gmaps_cartodb_layer.js',
      'src/geo/gmaps/torque.js',
      'src/geo/gmaps/gmaps.js',
      'src/geo/geocoder.js',

      //<!-- Common source -->
      'src/ui/common/dialog.js',
      'src/ui/common/share.js',
      'src/ui/common/notification.js',
      'src/ui/common/table.js',
      'src/ui/common/tabpane.js',
      'src/ui/common/dropdown.js',

      //<!-- vis -->
      'src/vis/vis.js',
      'src/vis/layers.js',
      'src/vis/overlays.js',

      // //<!-- api -->
      'src/api/layers.js',
      'src/api/sql.js',
      'src/api/vis.js',

      // //<!-- SPECS -->
      // //<!-- Core specs -->
      'test/spec/core/decorators.spec.js',
      'test/spec/core/config.spec.js',
      'test/spec/core/log.spec.js',
      'test/spec/core/model.spec.js',
      'test/spec/core/view.spec.js',
      'test/spec/core/template.spec.js',

      //<!-- Common specs -->
      'test/spec/ui/common/dialog.spec.js',
      'test/spec/ui/common/notification.spec.js',
      'test/spec/ui/common/table.spec.js',
      'test/spec/ui/common/tabpane.spec.js',

      //<!-- Geo specs -->
      'test/spec/geo/layer_definition.spec.js',
      'test/spec/geo/common.spec.js',
      'test/spec/geo/ui/tooltip.spec.js',

      'test/spec/geo/map.spec.js',
      'test/spec/geo/leaflet.spec.js',
      'test/spec/geo/geometry.spec.js',
      'test/spec/geo/legend.spec.js',
      'test/spec/geo/infowindow.spec.js',
      'test/spec/geo/layer_selector.spec.js',
      'test/spec/geo/gmaps.spec.js',
      'test/spec/geo/geocoder.spec.js',

      'test/spec/geo/gmaps_cartodb_layer/hide.js',
      'test/spec/geo/gmaps_cartodb_layer/interaction.js',
      'test/spec/geo/gmaps_cartodb_layer/opacity.js',
      'test/spec/geo/gmaps_cartodb_layer/show.js',

      'test/spec/vis/layers.spec.js',
      'test/spec/vis/vis.spec.js',

      'test/spec/api/layers.spec.js',
      'test/spec/api/layers/cartodb.spec.js',
      'test/spec/api/sql.spec.js'

    ],

    // list of files to exclude
    exclude: [
      
    ],

    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'test/spec/**/*.js': ['coverage']
    },

    // use dots reporter, as travis terminal does not support escaping sequences
    // possible values: 'dots', 'progress'
    // CLI --reporters progress
    reporters: ['progress', 'coverage'],

    junitReporter: {
      // will be resolved to basePath (in the same way as files/exclude patterns)
      outputFile: 'test-results.xml'
    },

    // web server port
    // CLI --port 9876
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    // CLI --colors --no-colors
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    // CLI --log-level debug
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    // CLI --auto-watch --no-auto-watch
    autoWatch: true,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    // CLI --browsers Chrome,Firefox,Safari
    browsers: [process.env.TRAVIS ? 'Firefox' : 'Chrome'],

    // If browser does not capture in given timeout [ms], kill it
    // CLI --capture-timeout 5000
    captureTimeout: 20000,

    // Auto run tests on start (when browsers are captured) and exit
    // CLI --single-run --no-single-run
    singleRun: false,

    // report which specs are slower than 500ms
    // CLI --report-slower-than 500
    reportSlowerThan: 500,

    // optionally, configure the reporter
    coverageReporter: {
      type : 'html',
      dir : 'test/coverage/'
    },

    plugins: [
      'karma-jasmine',
      'karma-sinon',
      'karma-coverage',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-junit-reporter',
      'karma-commonjs'
    ]
  });
};