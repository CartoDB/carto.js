var Backbone = require('backbone');

var CategoriesDataview = Backbone.Model.extend({

  initialize: function(attrs, options) {
    this._map = options.map;
    this._layer = options.layer;
  },

  getLayerId: function () {
    return this._layer.get('id');
  },

  getId: function () {
    // TODO: We should use the real id here. For anonymous maps, we can generate
    // a random UUID, but for named maps, we will need to use the same id that is
    // stored in the template.
    return this.cid;
  },

  toJSON: function () {
    return {
      type: 'aggregation',
      options: {
        column: this.get('column'),
        aggregation: this.get('aggregation'),
        aggregationColumn: this.get('aggregationColumn')
      }
    };
  }
});

module.exports = CategoriesDataview;
