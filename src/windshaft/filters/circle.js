var _ = require('underscore');
var Model = require('../../core/model');

// TODO: Add more detailed methods to 'set/get' center and radius

module.exports = Model.extend({
  initialize: function () {
    this._circle = {};
  },

  setCircle: function (circle) {
    this._circle = circle;
    this.trigger('circleChanged', circle);
  },

  getCircle: function () {
    return this._circle;
  },

  serialize: function () {
    return encodeURIComponent(JSON.stringify(this.getCircle()));
  }
});
