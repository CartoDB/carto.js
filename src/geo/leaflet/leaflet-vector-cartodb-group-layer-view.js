var L = require('leaflet');
var d3cdb = require('d3.cartodb');

var LeafletVectorCartoDBGroupLayerView = L.Class.extend({

  initialize: function (layerModel, leafletMap) {
    this.model = layerModel;
    this.map = leafletMap;

    this.model.bind('change:urls', function() {
      this.addVectorLayers();
      this.trigger('load');
    }, this);
  },

  addVectorLayers: function() {
    this.model.layers.each(this._addVectorLayer, this);
  },

  _addVectorLayer: function(layerModel){
    var d3Layer = new L.CartoDBd3Layer({
      tilejson: this.model.get("urls"),
      cartocss: layerModel.get("cartocss")
    });
    d3Layer.addTo(this.map);
  },

  onAdd: function(map) {
    // TODO: Add the logo?
  },

  onRemove: function(map) {
  },
});

module.exports = LeafletVectorCartoDBGroupLayerView;
