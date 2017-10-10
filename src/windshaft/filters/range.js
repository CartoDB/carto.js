var _ = require('underscore');
var WindshaftFilterBase = require('./base');

module.exports = WindshaftFilterBase.extend({
  constructor: function (options) {
    WindshaftFilterBase.apply(this, arguments);

    this._min = null;
    this._max = null;
  },

  isEmpty: function () {
    return !this._areMinMaxValid(this._min, this._max);
  },

  setRange: function (min, max, applyFilter) {
    if (!this._areMinMaxValid(min, max)) {
      throw new Error('Min and max values must be numbers.');
    }

    this._min = Math.min(min, max);
    this._max = Math.max(min, max);

    if (applyFilter !== false) {
      this.applyFilter();
    }
  },

  resetFilter: function () {
    this._min = null;
    this._max = null;
    this.applyFilter();
  },

  toJSON: function () {
    var filter = {
      type: 'range',
      column: this._column,
      params: {}
    };

    if (!this.isEmpty()) {
      filter.params = {
        min: this._min,
        max: this._max
      };
    }

    return filter;
  },

  _areMinMaxValid: function (min, max) {
    return _.isFinite(min) && _.isFinite(max);
  }
});
