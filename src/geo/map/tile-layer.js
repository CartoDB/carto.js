var LAYER_TYPES = require('../../vis/layer-types');
var LayerModelBase = require('./layer-model-base');

var TileLayer = LayerModelBase.extend({
  defaults: {
    type: LAYER_TYPES.TILED
  },

  getTileLayer: function () {}
});

module.exports = TileLayer;
