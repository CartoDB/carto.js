var _ = require('underscore');
var Backbone = require('backbone');

/**
 * base layer for all leaflet layers
 */
var LeafletLayerView = function (layerModel, leafletLayer, leafletMap) {
  this.leafletLayer = leafletLayer;
  this.leafletMap = leafletMap;
  this.model = layerModel;

  this.setModel(layerModel);

  var type = layerModel.get('type') || layerModel.get('kind');
  this.type = type && type.toLowerCase();
};

LeafletLayerView.prototype = {
  bind: Backbone.Events.bind,
  listenTo: Backbone.Events.listenTo,
  listenToOnce: Backbone.Events.listenToOnce,
  stopListening: Backbone.Events.stopListening,
  trigger: Backbone.Events.trigger,
  unbind: Backbone.Events.unbind
};

_.extend(LeafletLayerView.prototype, {

  setModel: function (model) {
    if (this.model) {
      this.model.unbind('change', this._modelUpdated, this);
    }
    this.model = model;
    this.model.bind('change', this._modelUpdated, this);
  },

  /**
   * remove layer from the map and unbind events
   */
  remove: function () {
    this.leafletMap.removeLayer(this.leafletLayer);
    this.trigger('remove', this);
    this.model.unbind(null, null, this);
    this.unbind();
  },

  reload: function () {
    this.leafletLayer.redraw();
  }
});

module.exports = LeafletLayerView;
