var _ = require('underscore');
var Backbone = require('backbone');
var WindshaftFilterBase = require('./base');

/**
 * Filter used by the category dataview
 */
module.exports = WindshaftFilterBase.extend({
  constructor: function (options) {
    WindshaftFilterBase.apply(this, arguments);

    this._rejectedCategories = new Backbone.Collection();
    this._acceptedCategories = new Backbone.Collection();
  },

  acceptedCategoriesSize: function () {
    return this._acceptedCategories.size();
  },

  rejectedCategoriesSize: function () {
    return this._rejectedCategories.size();
  },

  isEmpty: function () {
    return this.acceptedCategoriesSize() === 0 && this.rejectedCategoriesSize() === 0;
  },

  accept: function (values, applyFilter) {
    values = !_.isArray(values) ? [values] : values;

    _.each(values, function (value) {
      var d = { name: value };
      var rejectedMdls = this._rejectedCategories.where(d);
      var acceptedMdls = this._acceptedCategories.where(d);
      if (rejectedMdls.length > 0) {
        this._rejectedCategories.remove(rejectedMdls);
      } else if (!acceptedMdls.length) {
        this._acceptedCategories.add(d);
      }
    }, this);

    if (applyFilter !== false) {
      this.applyFilter();
    }
  },

  isAccepted: function (name) {
    return this._acceptedCategories.where({ name: name }).length > 0;
  },

  reject: function (values, applyFilter) {
    values = !_.isArray(values) ? [values] : values;

    _.each(values, function (value) {
      var d = { name: value };
      var acceptedMdls = this._acceptedCategories.where(d);
      var rejectedMdls = this._rejectedCategories.where(d);
      if (acceptedMdls.length > 0) {
        this._acceptedCategories.remove(acceptedMdls);
      } else {
        if (!rejectedMdls.length) {
          this._rejectedCategories.add(d);
        }
      }
    }, this);

    if (applyFilter !== false) {
      this.applyFilter();
    }
  },

  isRejected: function (name) {
    var acceptCount = this.acceptedCategoriesSize();
    if (this._rejectedCategories.where({ name: name }).length > 0) {
      return true;
    } else if (acceptCount > 0 && this._acceptedCategories.where({ name: name }).length === 0) {
      return true;
    } else {
      return false;
    }
  },

  resetFilter: function () {
    this._acceptedCategories.reset();
    this._rejectedCategories.reset();
    this.applyFilter();
  },

  toJSON: function () {
    var filter = {
      type: 'category',
      column: this._column,
      params: {}
    };
    var rejectCount = this.rejectedCategoriesSize();
    var acceptCount = this.acceptedCategoriesSize();
    var acceptedCats = { accept: _.pluck(this._acceptedCategories.toJSON(), 'name') };
    var rejectedCats = { reject: _.pluck(this._rejectedCategories.toJSON(), 'name') };

    if (acceptCount > 0) {
      filter.params = acceptedCats;
    } else if (rejectCount > 0 && acceptCount === 0) {
      filter.params = rejectedCats;
    }

    return filter;
  },

  getAcceptedCategoryNames: function () {
    return this._acceptedCategories.map(function (category) { return category.get('name'); });
  },

  getRejectedCategoryNames: function () {
    return this._rejectedCategories.map(function (category) { return category.get('name'); });
  }
});
