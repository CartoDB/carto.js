var Backbone = require('backbone');
var HistogramDataview = require('./histogram');
var CategoriesDataview = require('./categories');
var FormulaDataview = require('./formula');

var DataviewsCollection = Backbone.Collection.extend({

  initialize: function (models, options) {
    this._map = options.map;
  },

  createHistogramDataview: function (layer, dataviewAttributes) {
    this._validateRequiredAttributes(dataviewAttributes, [ 'column', 'bins' ]);

    return this.add(new HistogramDataview(dataviewAttributes, {
      map: this._map,
      layer: layer
    }));
  },

  createCategoriesDataview: function (layer, dataviewAttributes) {
    this._validateRequiredAttributes(dataviewAttributes, [ 'column', 'aggregation', 'aggregationColumn' ]);

    return this.add(new CategoriesDataview(dataviewAttributes, {
      map: this._map,
      layer: layer
    }));
  },

  createFormulaDataview: function (layer, dataviewAttributes) {
    this._validateRequiredAttributes(dataviewAttributes, [ 'column', 'operation' ]);

    return this.add(new FormulaDataview(dataviewAttributes, {
      map: this._map,
      layer: layer
    }));
  },

  _validateRequiredAttributes: function (attributes, requiredAttributes) {
    var missingAttributes = false;
    if (!attributes) {
      missingAttributes = true;
    } else {
      for (var i in requiredAttributes) {
        if (!attributes[requiredAttributes[i]]) {
          missingAttributes = true;
        }
      }
    }

    if (missingAttributes) {
      throw new Error('the following attributes are required: ' + requiredAttributes.join(', '));
    }
  }
});

module.exports = DataviewsCollection;
