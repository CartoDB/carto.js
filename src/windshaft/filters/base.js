var Model = require('../../core/model');

module.exports = Model.extend({
  constructor: function (options) {
    Model.apply(this);

    if (!options || !options.analysis || typeof options.analysis.addFilter === 'undefined') {
      throw new Error('Filter must have an instance of AnalysisModel.');
    }
    if (!options.column) {
      throw new Error('Filter must have a column.');
    }

    this._analysis = options.analysis;
    this._column = options.column;

    this._analysis.addFilter(this);
  },

  isEmpty: function () {
    throw new Error('Filters must implement the .isEmpty function');
  },

  toJSON: function () {
    throw new Error('Filters must implement the .toJSON function');
  },

  applyFilter: function () {
    this.trigger('change', this);
  },

  resetFilter: function () {
    throw new Error('Filters must implement the .resetFilter function');
  },

  remove: function () {
    this.trigger('destroy', this);
    this._analysis = null;
  }
});
