var log = require('cdb.log');
var LeafletTiledLayerView = require('./leaflet-tiled-layer-view');
var LeafletWMSLayerView = require('./leaflet-wms-layer-view');
var LeafletPlainLayerView = require('./leaflet-plain-layer-view');
var LeafletGmapsTiledLayerView = require('./leaflet-gmaps-tiled-layer-view');
var LeafletCartoDBLayerGroupView = require('./leaflet-cartodb-layer-group-view');
var LeafletTorqueLayer = require('./leaflet-torque-layer');
var LeafletCartoDBVectorLayerGroupView = require('./leaflet-cartodb-vector-layer-group-view');
var LAYER_TYPES = require('../../vis/layer-types');

var LayerGroupViewConstructor = function (layerGroupModel, mapModel, options) {
  if (options.vector) {
    var layerView = new LeafletCartoDBVectorLayerGroupView(layerGroupModel, mapModel);

    return layerView;
  }
  return new LeafletCartoDBLayerGroupView(layerGroupModel, mapModel);
};

var LeafletLayerViewFactory = function (options) {
  options = options || {};
  this._vector = options.vector;
};

var constructors = {};
constructors[LAYER_TYPES.TILED] = LeafletTiledLayerView;
constructors[LAYER_TYPES.WMS] = LeafletWMSLayerView;
constructors[LAYER_TYPES.PLAIN] = LeafletPlainLayerView;
constructors[LAYER_TYPES.GMAPSBASE] = LeafletGmapsTiledLayerView;
constructors[LAYER_TYPES.TORQUE] = LeafletTorqueLayer;
constructors['layergroup'] = LayerGroupViewConstructor;
constructors['namedmap'] = LayerGroupViewConstructor;

LeafletLayerViewFactory.prototype._constructors = constructors;

LeafletLayerViewFactory.prototype.createLayerView = function (layerModel, mapModel) {
  var layerType = layerModel.get('type').toLowerCase();
  var LayerViewClass = this._constructors[layerType];

  if (LayerViewClass) {
    try {
      return new LayerViewClass(layerModel, mapModel, {
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
