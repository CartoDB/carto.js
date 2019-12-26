var Model = require('../../core/model');

module.exports = Model.extend({
  initialize: function () {
    this._polygon = {};
  },

  setPolygon: function (polygon) {
    this._polygon = polygon;
    this.trigger('polygonChanged', polygon);
  },

  getPolygon: function () {
    return this._polygon;
  },

  serialize: function () {
    return encodeURIComponent(JSON.stringify(this.getPolygon()));
  }
});
