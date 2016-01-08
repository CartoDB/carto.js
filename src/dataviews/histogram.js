var Backbone = require('backbone');

var HistogramDataview = Backbone.Model.extend({

  initialize: function (attrs, options) {
    this._map = options.map;
    this._layer = options.layer;
  },

  getLayerId: function () {
    return this._layer.get('id');
  },

  getId: function () {
    return this.cid;
  },

  toJSON: function () {
    return {
      type: 'histogram',
      options: {
        column: this.get('column'),
        bins: this.get('bins')
      }
    };
  }
});

module.exports = HistogramDataview;
