var _ = require('underscore');
var L = require('leaflet');
var LeafletLayerView = require('./leaflet-layer-view');

/**
 * this is a dummy layer class that modifies the leaflet DOM element background
 * instead of creating a layer with div
 */
var LeafletPlainLayerView = L.Layer.extend({
  includes: L.Mixin.Events,

  initialize: function(layerModel, leafletMap) {
    LeafletLayerView.call(this, layerModel, this, leafletMap);
  },

  onAdd: function() {
    this.redraw();
  },

  onRemove: function() {
    var div = this.leafletMap.getContainer()
    div.style.background = 'none';
  },

  _modelUpdated: function() {
    this.redraw();
  },

  redraw: function() {
    var div = this.leafletMap.getContainer()
    div.style.backgroundColor = this.model.get('color') || '#FFF';

    if (this.model.get('image')) {
      var st = 'transparent url(' + this.model.get('image') + ') repeat center center';
      div.style.background = st
    }
  },

  _layerAdd: function () {

  },

  // this method
  setZIndex: function() {
  }

});

_.extend(LeafletPlainLayerView.prototype, LeafletLayerView.prototype);

module.exports = LeafletPlainLayerView;
