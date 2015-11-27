var Model = require('cdb/core/model');

/**
 * @classdesc Abstract base class for all filters. **Do not use directly**
 *
 * Any filter must implement at
 * least the operations `isEmpty()` and `toJSON()`.
 *
 * @class windshaft.filters.FilterBase
 * @extends core.Model
 */
var FilterBase = Model.extend( /** @lends windshaft.filters.FilterBase.prototype */ {

  /**
   * Informs if the filter is empty.
   *
   * @abstract
   * @return {bool} True if the filter is empty, false otherwise.
   */
  isEmpty: function() {
    throw "Filters must implement the .isEmpty method";
  },

  /**
   * Transform the filter into a JSON string.
   *
   * @abstract
   * @return {String} JSON string representation of the filter.
   */
  toJSON: function() {
    throw "Filters must implement the .toJSON method";
  }

});

module.exports = FilterBase;
