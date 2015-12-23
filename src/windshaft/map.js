var _ = require('underscore');

var _Map = function (options) {
  this._client = options.client;
  this._map = options.map;
  this._layerGroup = options.layerGroup;
  this._layers = options.layers;
  this._dataviews = options.dataviews;

  this._dataviews.bind('add remove reset', function () {
    this.createInstance();
  }, this);

  this.createInstance();
};

_Map.prototype.BOUNDING_BOX_FILTER_WAIT = 500;

_Map.prototype.createInstance = function () {
  this._client.instantiateMap({
    layers: this._layers,
    dataviews: this._dataviews,
    success: this._onInstanceCreated.bind(this)
  });
};

_Map.prototype._onInstanceCreated = function (mapInstance) {
  if (!this._instance) {
    var debouncedCreateInstance = _.debounce(this.createInstance, this.BOUNDING_BOX_FILTER_WAIT);
    this._map.bind('change:center change:zoom', debouncedCreateInstance, this);
  }

  this._instance = mapInstance;

  this._layerGroup.set({
    baseURL: mapInstance.getBaseURL(),
    urls: mapInstance.getTiles('mapnik')
  });

  // TODO: Set the URLs of dataViews (do it silently for dataviews that are NOT linked
  // to the layer or dataview that triggered the creation of the new instance
};

module.exports = _Map;
