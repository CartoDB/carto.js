var _ = require('underscore');
var MapBase = require('./map-base.js');

var NamedMap = MapBase.extend({
  toJSON: function () {
    var json = {};
    var layers = this._getLayers();
    var styles = layers.reduce(function (p, c, i) {
      var layerIndex = c.getLayerIndex() || i;
      var style = c.get('cartocss');
      if (style) {
        p[layerIndex] = style;
      }
      return p;
    }, {});
    _.each(layers, function (layerModel, index) {
      var layerIndex = layerModel.getLayerIndex() || index;
      json['layer' + layerIndex] = layerModel.isVisible() ? 1 : 0;
    });
    json.styles = styles;
    return json;
  }
});

module.exports = NamedMap;
