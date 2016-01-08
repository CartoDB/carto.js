var Backbone = require('backbone');

var FormulaDataview = Backbone.Model.extend({

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
      type: 'formula',
      options: {
        column: this.get('column'),
        operation: this.get('operation')
      }
    };
  }
});

module.exports = FormulaDataview;
