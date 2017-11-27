var L = require('leaflet');
var Layer = require('./layer');
var Layers = require('./layers');
var CartoError = require('./error');
var LayerBase = require('./layer/base');
var LeafletCartoLayerGroupView = require('../../geo/leaflet/leaflet-cartodb-layer-group-view');

/**
 * This object is a custom Leaflet layer to enable feature interactivity
 * using an internal LeafletCartoLayerGroupView instance.
 *
 * There are some overwritten functions:
 * - getAttribution: returns always a custom OpenStreetMap / Carto attribution message
 * - addTo: when the layer is added to a map it also creates a LeafletCartoLayerGroupView
 *          object called `_internalView` in order to enable the feature events
 * - removeFrom: when the layer is removed from a map it also removes the feature events
 *               listeners, triggers a 'remove' event and removes the `_internalView`
 *
 * NOTE: It also contains the feature events handlers. That's why it requires the carto layers array.
 */

var LeafletLayer = L.TileLayer.extend({
  options: {
    opacity: 0.99,
    maxZoom: 30
  },

  initialize: function () {
    this._layers = new Layers();
    this._engine = null;
    this._internalView = null;
  },

  getAttribution: function () {
    return '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>';
  },

  addTo: function (map) {
    if (!this._internalView) {
      this._internalView = new LeafletCartoLayerGroupView(this._engine._cartoLayerGroup, {
        nativeMap: map,
        nativeLayer: this
      });
      this._internalView.on('featureClick', this._onFeatureClick, this);
      this._internalView.on('featureOver', this._onFeatureOver, this);
      this._internalView.on('featureOut', this._onFeatureOut, this);
    }

    return L.TileLayer.prototype.addTo.call(this, map);
  },

  removeFrom: function (map) {
    if (this._internalView) {
      this._internalView.off('featureClick');
      this._internalView.off('featureOver');
      this._internalView.off('featureOut');
      this._internalView.notifyRemove();
    }
    this._internalView = null;

    return L.TileLayer.prototype.removeFrom.call(this, map);
  },

  addLayer: function (layer) {
    return this.addLayers([layer]);
  },

  addLayers: function (layers) {
    layers.forEach(this._addLayer, this);
    return this._reload();
  },

  removeLayer: function (layer) {
    return this.removeLayers([layer]);
  },

  removeLayers: function (layers) {
    layers.forEach(this._removeLayer, this);
    return this._reload();
  },

  getLayers: function () {
    return this._layers.toArray();
  },

  _addLayer: function (layer) {
    this._checkLayer(layer);
    this._layers.add(layer);
    if (!this._engine) {
      this._engine = layer.$getEngine();
    }
    // TODO: check current.engine and layer.engine
    this._engine.addLayer(layer.$getInternalModel());
  },

  _removeLayer: function (layer) {
    this._checkLayer(layer);
    // TODO: check current.engine
    this._layers.remove(layer);
    this._engine.removeLayer(layer.$getInternalModel());
  },

  _checkLayer: function (object) {
    if (!(object instanceof LayerBase)) {
      throw new TypeError('The given object is not a layer');
    }
  },

  _reload: function () {
    return this._engine.reload()
      .then(function () {
        return Promise.resolve();
      })
      .catch(function (error) {
        return Promise.reject(new CartoError(error));
      });
  },

  _onFeatureClick: function (internalEvent) {
    this._triggerLayerFeatureEvent(Layer.events.FEATURE_CLICKED, internalEvent);
  },

  _onFeatureOver: function (internalEvent) {
    var layer = this._layers.findById(internalEvent.layer.id);
    if (layer && (layer.hasFeatureClickColumns() || layer.hasFeatureOverColumns())) {
      this._map.getContainer().style.cursor = 'pointer';
    }
    this._triggerLayerFeatureEvent(Layer.events.FEATURE_OVER, internalEvent);
  },

  _onFeatureOut: function (internalEvent) {
    this._map.getContainer().style.cursor = 'auto';
    this._triggerLayerFeatureEvent(Layer.events.FEATURE_OUT, internalEvent);
  },

  _triggerLayerFeatureEvent: function (eventName, internalEvent) {
    var layer = this._layers.findById(internalEvent.layer.id);
    if (layer) {
      var event = {
        data: undefined,
        latLng: undefined
      };
      if (internalEvent.feature) {
        event.data = internalEvent.feature;
      }
      if (internalEvent.latlng) {
        event.latLng = {
          lat: internalEvent.latlng[0],
          lng: internalEvent.latlng[1]
        };
      }

      /**
       *
       * Events triggered by {@link carto.layer.Layer} when users interact with a feature.
       *
       * @event carto.layer.Layer.FeatureEvent
       * @property {LatLng} latLng - Object with coordinates where interaction took place
       * @property {object} data - Object with feature data (one attribute for each specified column)
       *
       * @api
       */
      layer.trigger(eventName, event);
    }
  }
});

module.exports = LeafletLayer;
