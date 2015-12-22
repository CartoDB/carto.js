var FormulaDataview = function (map, layer, dataviewOptions) {
  this._map = map;
  this._layer = layer;
  this._column = dataviewOptions.column;
  this._function = dataviewOptions.function;

  if (!this._column || !this._function) {
    throw new Error('column and function options are required');
  }
};

FormulaDataview.prototype.getValue = function (options, callback) {

};

module.exports = FormulaDataview;
