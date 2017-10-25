var LeafletView = require('../../../src/geo/leaflet/leaflet-cartodb-layer-group-view');

var core = require('./core');
var layer = require('./layer');
var source = require('./source');
var style = require('./style');

// Expose CartoLayerGroup under the leaflet namespace
window.LeafletCartoDBLayerGroupView = function (engine) {
  return {
    addTo: function (map) {
      var view = new LeafletView(engine.getLayerGroup(), map);
      view.leafletLayer.addTo(map);
    }
  };
};

module.exports = {
  core: core,
  layer: layer,
  source: source,
  style: style
};
