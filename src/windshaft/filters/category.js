var _ = require('underscore');
var Backbone = require('backbone');
var WindshaftFilterBase = require('./base');

/**
 *  @classdesc Category filter used to maintain a list of categories. Allows to
 *  specify which are accepted and which are rejected.
 *
 * 	@class windshaft.filters.FilterCategory
 * 	@extends windshaft.filters.FilterBase
 */
var FilterCategory = WindshaftFilterBase.extend( /** @lends windshaft.filters.FilterCategory.prototype */ {

  /**
   * Default values.
   * @property {bool} rejectAll By default all categories are accepted
   */
  defaults: {
    rejectAll: false
  },

  /**
   * Backbone's initialize
   * @private
   */
  initialize: function() {
    this.rejectedCategories = new Backbone.Collection();
    this.acceptedCategories = new Backbone.Collection();
    this._initBinds();
  },

  /**
   * Binds events.
   * @private
   */
  _initBinds: function() {
    this.rejectedCategories.bind('add remove', function() {
      this.set('rejectAll', false);
    }, this);
    this.acceptedCategories.bind('add remove', function() {
      this.set('rejectAll', false);
    }, this);
  },

  /**
   * @override
   * @inheritdoc
   */
  isEmpty: function() {
    return this.rejectedCategories.size() === 0 && this.acceptedCategories.size() === 0 && !this.get('rejectAll');
  },

  /**
   * Accept a set of categories.
   *
   * @param  {(Array.<String>|Sting)} values  Category or array of categories.
   * @param  {Function} applyFilter **TODO Document this callback**
   */
  accept: function(values, applyFilter) {
    values = !_.isArray(values) ? [values] : values;
    var acceptedCount = this.acceptedCategories.size();

    _.each(values, function(value) {
      var d = { name: value };
      var rejectedMdls = this.rejectedCategories.where(d);
      var acceptedMdls = this.acceptedCategories.where(d);
      if (rejectedMdls.length > 0) {
        this.rejectedCategories.remove(rejectedMdls);
      }
      if (!acceptedMdls.length) {
        this.acceptedCategories.add(d);
      }
    }, this);

    if (applyFilter !== false) {
      this.applyFilter();
    }
  },

  /**
   * Accept all categories (simply clearing the filter and setting the
   * `rejectAll` attribute to false).
   */
  acceptAll: function() {
    this.set('rejectAll', false);
    this.cleanFilter();
  },

  /**
   * Determines if a category is accepted or not.
   *
   * @param  {String} name Category to check.
   * @return {bool} True if the category is whithin the accepted categories of
   * the filter, false otherwise.
   */
  isAccepted: function(name) {
    return this.acceptedCategories.where({ name: name }).length > 0;
  },

  /**
   * Returns the collection of accepted categories.
   * @return {Backbone.Collection} Collection of categories
   */
  getAccepted: function() {
    return this.acceptedCategories;
  },

  /**
   * Reject a set of categories.
   *
   * @param  {(Array.<String>|Sting)} values  Category or array of categories.
   * @param  {Function} applyFilter **TODO Document this callback**
   */
  reject: function(values, applyFilter) {
    values = !_.isArray(values) ? [values] : values;

    _.each(values, function(value) {
      var d = { name: value };
      var acceptedMdls = this.acceptedCategories.where(d);
      var rejectedMdls = this.rejectedCategories.where(d);
      if (acceptedMdls.length > 0) {
        this.acceptedCategories.remove(acceptedMdls);
      } else {
        if (!rejectedMdls.length) {
          this.rejectedCategories.add(d);
        }
      }
    }, this);

    if (applyFilter !== false) {
      this.applyFilter();
    }
  },

  /**
   * Determines if a category is rejected or not.
   *
   * @param  {String} name Category to check.
   * @return {bool} True if the category is whithin the rejected categories of
   * the filter, false otherwise.
   */
  isRejected: function(name) {
    var rejectCount = this.rejectedCategories.size();
    var acceptCount = this.acceptedCategories.size();
    if (this.rejectedCategories.where({ name: name }).length > 0) {
      return true;
    } else if (acceptCount > 0 && this.acceptedCategories.where({ name: name }).length === 0) {
      return true;
    } else if (this.get('rejectAll')) {
      return true;
    } else {
      return false;
    }
  },

  /**
   * Returns the collection of rejected categories.
   * @return {Backbone.Collection} Collection of categories
   */
  getRejected: function() {
    return this.rejectedCategories;
  },

  /**
   * Reject all categories (simply clearing the filter and setting the
   * `rejectAll` attribute to true).
   */
  rejectAll: function() {
    this.set('rejectAll', true);
    this.cleanFilter();
  },

  /**
   * Cleans the filter
   * @param  {bool} triggerChange Indicates if the clean acction must involve
   * triggering a `change` event so that listeners can be notified.
   */
  cleanFilter: function(triggerChange) {
    this.acceptedCategories.reset();
    this.rejectedCategories.reset();
    if (triggerChange !== false) {
      this.applyFilter();
    }
  },

  /**
   * Triggers a `change` event so listener classes knows the filter has changes.
   * @private
   */
  applyFilter: function() {
    this.trigger('change', this);
  },

  /**
   * @override
   * @inheritdoc
   */
  toJSON: function() {
    var filter = {};
    var rejectCount = this.rejectedCategories.size();
    var acceptCount = this.acceptedCategories.size();
    var acceptedCats = { accept: _.pluck(this.acceptedCategories.toJSON(), 'name') };
    var rejectedCats = { reject: _.pluck(this.rejectedCategories.toJSON(), 'name') };

    if (this.get('rejectAll')) {
      filter = { accept: [] };
    } else if (acceptCount > 0) {
      filter = acceptedCats;
    } else if (rejectCount > 0 && acceptCount === 0) {
      filter = rejectedCats;
    }

    var json = {};
    json[this.get('widgetId')] = filter;

    return json;
  }
});


module.exports = FilterCategory;
