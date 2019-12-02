var bundles = require('./_browserify-bundles');

/**
 *  Manger-compressor for CARTO.js ES6+ compliant
 *
 */
module.exports = {
  task: function() {
    var cfg = {};

    for (var bundleName in bundles) {
      if (!/tmp|specs/.test(bundleName)) {
        var files = {};
        var src = bundles[bundleName].dest;
        var uglifiedDest = src.replace('.uncompressed', '');
        files[uglifiedDest] = src;

        cfg[bundleName] = {
          options: {
            sourceMap: true
          },
          files: files
        }
      }
    }

    return cfg;
  }
}
