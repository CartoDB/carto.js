/**
 * Add banner for CARTO.jss
 *
 */
module.exports = {
  task: function() {
    var cfg = {
      options: {
        position: 'top',
        banner: [
          '// CartoDB.js version: <%= version %>',
          '// sha: <%= gitinfo.local.branch.current.SHA %>',
        ].join('\n')
      },
      files: {
        src: [
          '<%= dist %>/internal/cartodb.uncompressed.js',
          '<%= dist %>/internal/cartodb.js'
        ]
      }
    };
    return cfg;
  }
}
