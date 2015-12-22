var HistogramDataview = function (map, layer, filter, dataviewOptions) {
  this._map = map;
  this._layer = layer;
  this._filter = filter;
  this._column = dataviewOptions.column;
  this._bins = dataviewOptions.bins;

  if (!this._column || !this._bins) {
    throw new Error('column and bins options are required');
  }
};

HistogramDataview.prototype.getHistogram = function (options, callback) {

};

HistogramDataview.prototype.getFilter = function (options) {
  return this._filter;
};

module.exports = HistogramDataview;
