var _ = require('underscore');
var log = require('../../cdb.log');
var Model = require('../../core/model');

var LayerModelBase = Model.extend({

  /**
   * Names of attrs used to compare two layer models
   * @type {Array}
   */
  EQUALITY_ATTRIBUTES: [],

  initialize: function () {
    this.bind('change:type', function () {
      log.error('changing layer type is not allowed, remove it and add a new one instead');
    });
  },

  // PUBLIC API METHODS

  remove: function (opts) {
    opts = opts || {};
    this.trigger('destroy', this, this.collection, opts);
  },

  update: function (attrs, options) {
    options = options || {};

    // TODO: Pick the attributes for the specific type of layer
    // Eg: this.set(_.pick(attrs, this.ATTR_NAMES))
    this.set(attrs, {
      silent: options.silent
    });
  },

  show: function () {
    this.set('visible', true);
  },

  hide: function () {
    this.set('visible', false);
  },

  isVisible: function () {
    return !!this.get('visible');
  },

  isHidden: function () {
    return !this.isVisible();
  },

  toggle: function () {
    this.set('visible', !this.get('visible'));
  },

  // INTERNAL CartoDB.js METHODS

  setOk: function () {
    this.unset('error');
  },

  setError: function (error) {
    this.set('error', error);
  },

  isEqual: function (otherLayerModel) {
    var equalityAttributes = _.union(['type'], this.EQUALITY_ATTRIBUTES);
    return this._areAllAttrsEqual(otherLayerModel, equalityAttributes);
  },

  _areAllAttrsEqual: function (otherLayerModel, attributes) {
    var self = this;
    return _.every(attributes, function (attribute) {
      return self.get(attribute) === otherLayerModel.get(attribute);
    });
  }
});

module.exports = LayerModelBase;
