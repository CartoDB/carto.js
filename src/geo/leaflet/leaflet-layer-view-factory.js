var log = require('cdb.log');
var LeafletTiledLayerView = require('./leaflet-tiled-layer-view');
var LeafletWMSLayerView = require('./leaflet-wms-layer-view');
var LeafletPlainLayerView = require('./leaflet-plain-layer-view');
var LeafletCartoDBLayerGroupView = require('./leaflet-cartodb-layer-group-view');
var LeafletTorqueLayerView = require('./leaflet-torque-layer-view');
var LeafletCartoDBWebglLayerGroupView = require('./leaflet-cartodb-webgl-layer-group-view');
// Should we expose a Tangram.cartodb method for doing this?
var CCSS = require('tangram-cartocss');

// Make this configurable and crate a pipe of decision based on the configuration.
var shouldLoadWithVector = function (metadata, cb) {
  // NOTE: the limit should be setted by the server?
  if (metadata.stats && metadata.stats.size && metadata.stats.size > 10e6) {
    return false;
  }
  else {
    try {
      metadata.layers.forEach(function (layer, i) {
        if (layer.type === 'mapnik') {
          CCSS.carto2Draw(layer.meta.cartocss, i);
        }
      });
    }
    catch (e) {
      // TODO: show why it is not working and give feedback to the user
      return false;
    }
    return true;
  }
};

var LayerGroupViewConstructor = function (layerGroupModel, mapInstance, mapModel, options) {

  if (shouldLoadWithVector(mapModel.get('metadata'))) {
    return new LeafletCartoDBWebglLayerGroupView(layerGroupModel, mapInstance);
  }
  return new LeafletCartoDBLayerGroupView(layerGroupModel, mapInstance);
};

var LeafletLayerViewFactory = function (options) {
  options = options || {};
  this._vector = options.vector;
  this._webgl = options.webgl;
};

LeafletLayerViewFactory.prototype._constructors = {
  'tiled': LeafletTiledLayerView,
  'wms': LeafletWMSLayerView,
  'plain': LeafletPlainLayerView,
  'layergroup': LayerGroupViewConstructor,
  'torque': LeafletTorqueLayerView
};

LeafletLayerViewFactory.prototype.createLayerView = function (layerModel, mapInstance, mapModel) {
  var layerType = layerModel.get('type').toLowerCase();
  var LayerViewClass = this._constructors[layerType];

  if (LayerViewClass) {
    try {
      return new LayerViewClass(layerModel, mapInstance, mapModel, {
        vector: this._vector
      });
    } catch (e) {
      log.error("Error creating an instance of layer view for '" + layerType + "' layer -> " + e.message);
      throw e;
    }
  } else {
    log.error("Error creating an instance of layer view for '" + layerType + "' layer. Type is not supported");
  }
};

module.exports = LeafletLayerViewFactory;
