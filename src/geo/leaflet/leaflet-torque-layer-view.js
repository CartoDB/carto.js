/* global L */
require('torque.js');
var _ = require('underscore');
var util = require('cdb.core.util');
var LeafletLayerView = require('./leaflet-layer-view');
var TorqueLayerViewBase = require('../torque-layer-view-base');
var Backbone = require('backbone');

/**
 * leaflet torque layer
 * Assumes torque.js to have been loaded
 */
var LeafletTorqueLayer = L.TorqueLayer.extend({
  initialize: function (layerModel, leafletMap) {
    var query = this._getQuery(layerModel);

    var attrs = this._initialAttrs(layerModel);
    _.extend(attrs, {
      dynamic_cdn: layerModel.get('dynamic_cdn'),
      instanciateCallback: function () {
        var cartocss = layerModel.get('cartocss') || layerModel.get('tile_style');
        return '_cdbct_' + util.uniqueCallbackName(cartocss + query);
      }
    });

    // initialize the base layers
    L.TorqueLayer.prototype.initialize.call(this, attrs);

    LeafletLayerView.call(this, layerModel, this, leafletMap);

    // match leaflet events with backbone events
    this.fire = this.trigger;

    this._init(layerModel); // available due to this model being extended with torque-layer-base
  },

  _modelUpdated: function (model) {
    var changed = this.model.changedAttributes();
    if (changed === false) return;

    if ('visible' in changed) {
      this.model.get('visible') ? this.show() : this.hide();
    }

    if ('cartocss' in changed) {
      this.setCartoCSS(this.model.get('cartocss'));
    }

    if ('tileURLTemplates' in changed) {
      // REAL HACK
      this.provider.templateUrl = this.model.getTileURLTemplates()[0];
      // set meta
      _.extend(this.provider.options, this.model.get('meta'));
      this.model.set(this.model.get('meta'));
      // this needs to be deferred in order to break the infinite loop
      // of setReady changing keys and keys updating the model
      // If we do this in the next iteration 'tileURLTemplates' will not be in changedAttributes
      // so this will not pass through this code
      setTimeout(function () {
        this.provider._setReady(true);
        this._reloadTiles();
      }.bind(this), 0);
    }
  }
});

_.extend(LeafletTorqueLayer.prototype, TorqueLayerViewBase, L.Layer.extend(TorqueLayerViewBase).prototype);
_.extend(LeafletTorqueLayer.prototype, LeafletLayerView.prototype);

_.extend(LeafletTorqueLayer.prototype, {
  on: Backbone.Events.on,
});

// _.extend(LeafletLayerView.prototype, Backbone.Events);


module.exports = LeafletTorqueLayer;
