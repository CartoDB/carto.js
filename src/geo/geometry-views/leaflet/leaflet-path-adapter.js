var PathAdapterBase = require('../base/path-adapter-base');

var LeafletPathAdapter = function (nativePath) {
  nativePath._latlngs = nativePath._latlngs[0].length > 0 ? nativePath._latlngs[0] : nativePath._latlngs;
  this._nativePath = nativePath;
};

LeafletPathAdapter.prototype = new PathAdapterBase();
LeafletPathAdapter.prototype.constructor = LeafletPathAdapter;

LeafletPathAdapter.prototype.addToMap = function (leafletMap) {
  leafletMap.addLayer(this._nativePath);
};

LeafletPathAdapter.prototype.removeFromMap = function (leafletMap) {
  leafletMap.removeLayer(this._nativePath);
};

LeafletPathAdapter.prototype.isAddedToMap = function (leafletMap) {
  return leafletMap.hasLayer(this._nativePath);
};

LeafletPathAdapter.prototype.getCoordinates = function () {
  return this._nativePath.getLatLngs();
};

LeafletPathAdapter.prototype.setCoordinates = function (coordinates) {
  this._nativePath.setLatLngs(coordinates);
  this._nativePath._latlngs = this._nativePath._latlngs[0].length > 0 ? this._nativePath._latlngs[0] : this._nativePath._latlngs;
};

module.exports = LeafletPathAdapter;
