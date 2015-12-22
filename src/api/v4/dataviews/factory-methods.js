var HistogramDataview = require('./histogram');
var CategoriesDataview = require('./categories');
var FormulaDataview = require('./formula');
var RangeFilter = require('../filters/range');
var CategoryFilter = require('../filters/category');

module.exports = {

  createHistogramDataview: function (layer, dataviewOptions) {
    try {
      var filter = new RangeFilter();
      // TODO: We need a reference to the map here. Perhaps this method (createHistogramDataView)
      // could be part of an object that holds a reference to the map? Or we could ask the layer for
      // the map (layer.getMap)? What type of map should we expose?
      return new HistogramDataview(map, layer, filter, dataviewOptions);
    } catch (error) {
      throw Error.new('Error creating histogram dataview: ' + error.message);
    }
  },

  createCategoriesDataview: function (layer, dataviewOptions) {
    try {
      var filter = new CategoryFilter();
      // TODO: We need a reference to the map here
      return new CategoriesDataview(map, layer, filter, dataviewOptions);
    } catch (error) {
      throw Error.new('Error creating categories dataview: ' + error.message);
    }
  },

  createFormulaDataview: function (map, layer, dataviewOptions) {
    try {
      // TODO: We need a reference to the map here
      return new FormulaDataview(map, layer, dataviewOptions);
    } catch (error) {
      throw Error.new('Error creating formula dataview: ' + error.message);
    }
  }
};
