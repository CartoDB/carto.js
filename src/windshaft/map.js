var _Map = function (options) {
  this._client = options.client;
  this._layerGroup = options.layerGroup;
  this._layers = options.layers;
  this._dataviews = options.dataviews;

  this._dataviews.bind('add remove reset', function () {
    this.createInstance();
  }, this);

  this.createInstance();
};

_Map.prototype.createInstance = function () {
  this._client.instantiateMap({
    layers: this._layers,
    dataviews: this._dataviews,
    success: this._onInstanceCreated.bind(this)
  });
};

_Map.prototype._onInstanceCreated = function (mapInstance) {
  this._layerGroup.set({
    baseURL: mapInstance.getBaseURL(),
    urls: mapInstance.getTiles('mapnik')
  });
};

module.exports = _Map;
