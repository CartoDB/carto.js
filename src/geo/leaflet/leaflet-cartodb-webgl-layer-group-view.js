var TC = require('tangram.cartodb');
var LeafletLayerView = require('./leaflet-layer-view');
var L = require('leaflet');

var LeafletCartoDBWebglLayerGroupView = L.Layer.extend({
  includes: [
    LeafletLayerView.prototype
  ],

  options: {
    minZoom: 0,
    maxZoom: 28,
    tileSize: 256,
    zoomOffset: 0,
    tileBuffer: 50
  },

  events: {
    featureOver: null,
    featureOut: null,
    featureClick: null
  },

  initialize: function (layerGroupModel, map) {
    LeafletLayerView.call(this, layerGroupModel, this, map);
    layerGroupModel.bind('change:urls',
      this._onURLsChanged(layerGroupModel.getTileURLTemplates.bind(layerGroupModel))
    );

    this.tangram = new TC(map);

    layerGroupModel.each(this._onLayerAdded, this);
    layerGroupModel.onLayerAdded(this._onLayerAdded.bind(this));
  },

  onAdd: function () {},

  _onLayerAdded: function (layer, i) {
    var self = this;
    layer.bind('change:meta change:visible', function (e) {
      self.tangram.addLayer(e.attributes, (i + 1));
    });
  },

  setZIndex: function () {},

  _onURLsChanged: function (getUrl) {
    var self = this;
    return function () {
      self.tangram.addDataSource(getUrl('mvt'));
    };
  }
});

module.exports = LeafletCartoDBWebglLayerGroupView;
