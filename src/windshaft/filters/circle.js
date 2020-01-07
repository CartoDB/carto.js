var Model = require('../../core/model');

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
