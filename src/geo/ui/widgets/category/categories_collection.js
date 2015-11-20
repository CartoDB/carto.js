var _ = require('underscore');
var Backbone = require('backbone');
var CategoryItemModel = require('./category_item_model');

/**
 *  Data categories collection
 *
 *  - It basically sorts by (value, selected and "Other").
 */

module.exports = Backbone.Collection.extend({

  model: CategoryItemModel,

  comparator: function(a,b) {
    if (a.get('name') === 'Other') {
      return 1;
    } else if (b.get('name') === 'Other') {
      return -1;
    } else if (a.get('value') === b.get('value')) {
      return (a.get('selected') < b.get('selected')) ? 1 : -1;
    } else {
      return (a.get('value') < b.get('value')) ? 1 : -1;
    }
  }

});
