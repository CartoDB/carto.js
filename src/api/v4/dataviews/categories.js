// TODO: Instances of Windshaft Clients will need to know how to serialize
// each type of Dataview. Widgets now implement a toJSON method... Should
// we do the same thing here?
var CategoriesDataview = function (map, layer, filter, dataviewOptions) {
  this._map = map;
  this._layer = layer;
  this._filter = filter;
  this._column = dataviewOptions.column;
  this._aggregationColumn = dataviewOptions.aggregationColumn;

  if (!this._column || !this._aggregationColumn) {
    throw new Error('column and aggregationColumn options are required');
  }
};

CategoriesDataview.prototype.getCategories = function (options, callback) {

  // TODO: Decide how the callback should be specified:
  //  - a. Adopt the node.js approach (err, data)
  //  - b. Adopt the jquery approach (sucess and error callbacks)
  //  - c. Return a promise

  // TODO: Based on the options and how this._layer has been rendered
  // this method will need to fetch the categories from:
  //  a. A Windshaft URL
  //  b. The layer object that has been added to the map and knows how
  //     to extract information from the GEOJSON tiles
  // For example, if the layer has been rendered in the client and we don't
  // want to filter categories to the actual bounding box, we'll need to
  // fetch them from the Windshaft URL
};

CategoriesDataview.prototype.search = function (options, callback) {

};

CategoriesDataview.prototype.getFilter = function (options) {
  return this._filter;
};

module.exports = CategoriesDataview;
