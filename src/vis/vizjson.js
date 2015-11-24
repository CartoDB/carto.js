var _ = require('underscore');
var Layers = require('./vis/layers');

var VizJSON = function(data, vis) {
  this.data = data;
  this.vis = vis; // TODO: Remove this -> Currently used by Layers.create
  this.basemapLayer;
  this.userLayers = [];

  this._parse();
};

VizJSON.prototype._parse = function() {
  _.each(this.data.layers, function(layerData, index) {
    if (layerData.type === 'tiled' && index === 0) {
      this.basemapLayer = Layers.create(layerData.type, this.vis, layerData);
    }
    if (layerData.type === 'layergroup') {
      _.each(layerData.options.layer_definition.layers, function(layerData) {
        var layer = Layers.create(layerData.type, this.vis, layerData);
        this.userLayers.push(layer);
      }, this);
    } else {

    }
  }, this);
};

VizJSON.prototype.getUserLayers = function() {
  return this.userLayers;
};

VizJSON.prototype.getBasemapLayer = function() {
  return this.basemapLayer;
};

module.exports = VizJSON;