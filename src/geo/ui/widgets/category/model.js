var _ = require('underscore');
var Backbone = require('backbone');
var Model = require('cdb/core/model');
var WidgetModel = require('../widget_model');
var WidgetSearchModel = require('./search_model.js');
var CategoriesCollection = require('./categories_collection');
var LockedCatsCollection = require('./locked_categories_collection');

/**
 * Category widget model
 */
module.exports = WidgetModel.extend({

  url: function() {
    return this.get('url') + '?bbox=' + this.get('boundingBox') + '&own_filter=' + (this.get('locked') ? 1 : 0);
  },

  initialize: function(attrs, opts) {
    this._data = new CategoriesCollection();

    WidgetModel.prototype.initialize.call(this, attrs, opts);

    // Locked categories collection
    this.locked = new LockedCatsCollection();

    // Search model
    this.search = new WidgetSearchModel({}, {
      locked: this.locked
    });
  },

  _onChangeBinds: function() {
    // Set url and bounds when they have changed
    this.search.set({
      url: this.get('url'),
      boundingBox: this.get('boundingBox')
    });

    this.bind('change:url', function(){
      if (this.get('sync')) {
        this._fetch();
      }
    }, this);

    this.bind('change:boundingBox', function() {
      // If a search is applied and bounding bounds has changed,
      // don't fetch new raw data
      if (this.get('bbox') && !this.isSearchApplied()) {
        this._fetch();
      }
    }, this);

    this.bind('change:url change:boundingBox', function() {
      this.search.set({
        url: this.get('url'),
        boundingBox: this.get('boundingBox')
      });
    }, this);

    this.locked.bind('change add remove', function() {
      this.trigger('lockedChange', this.locked, this);
    }, this);

    // TODO: review this events propagation from search model
    this.search.bind('loading', function() {
      this.trigger("loading", this);
    }, this);
    this.search.bind('sync', function() {
      this.trigger("sync", this);
    }, this);
    this.search.bind('error', function() {
      this.trigger("error", this);
    }, this);
  },

  // Helper methods

  getLockedSize: function() {
    return this.locked.size();
  },

  isLocked: function() {
    return this.get('locked');
  },

  canBeLocked: function() {
    return this.isLocked() ||
      this.filter.hasAccepts();
  },

  canApplyLocked: function() {
    var acceptedCollection = this.filter.getAccepted();
    if (this.filter.getAccepted().size() !== this.locked.size()) {
      return true;
    }

    return acceptedCollection.find(function(m) {
      return !this.locked.isItemLocked(m.get('name'));
    }, this);
  },

  getData: function() {
    return this._data;
  },

  getSearch: function() {
    return this.search;
  },

  isSearchApplied: function() {
    return this.search.isSearchApplied();
  },

  getSize: function() {
    return this._data.size();
  },

  getCount: function() {
    return this.get('categoriesCount');
  },

  // Apply functions

  cleanSearch: function() {
    this.locked.resetItems([]);
    this.search.resetData();
  },

  setupSearch: function() {
    if (!this.isSearchApplied()) {
      var acceptedCats = this.filter.getAccepted().toJSON();
      this.locked.addItems(acceptedCats);
      this.search.setData(
        this._data.toJSON()
      );
    }
  },

  applyLocked: function() {
    var currentLocked = this.locked.getItemsName();
    if (!currentLocked.length) {
      this.unlockCategories();
      return false;
    }
    this.set('locked', true);
    this.filter.cleanFilter(false);
    this.filter.accept(currentLocked);
    this.filter.applyFilter();
    this.cleanSearch();
  },

  lockCategories: function() {
    this.set('locked', true);
    this._fetch();
  },

  unlockCategories: function() {
    this.set('locked', false);
    this.filter.acceptAll();
  },

  // Data parser methods //

  _parseData: function(categories) {
    // Get info stats from categories
    var newData = [];
    var _tmpArray = {};

    _.each(categories, function(datum) {
      var category = datum.category;
      var isRejected = this.filter.isRejected(category);
      _tmpArray[category] = true;
      newData.push({
        selected: !isRejected,
        name: category,
        agg: datum.agg,
        value: datum.value
      });
    }, this);


    if (this.isLocked()) {
      var acceptedCats = this.filter.getAccepted();
      // Add accepted items that are not present in the categories data
      acceptedCats.each(function(mdl) {
        var category = mdl.get('name');
        if (!_tmpArray[category]) {
          newData.push({
            selected: true,
            name: category,
            agg: false,
            value: 0
          });
        }
      }, this);
    }

    return {
      data: newData
    }
  },

  setCategories: function(d) {
    var attrs = this._parseData(d);
    this._data.reset(attrs.data);
    this.set(attrs);
  },

  parse: function(d) {
    var categories = d.categories;
    var attrs = this._parseData(categories);

    _.extend(attrs, {
        nulls: d.nulls,
        min: d.min,
        max: d.max,
        count: d.count,
        categoriesCount: d.categoriesCount
      }
    );
    this._data.reset(attrs.data);
    return attrs;
  },

  // Backbone toJson function override

  toJSON: function() {
    return {
      type: "aggregation",
      options: {
        column: this.get('column'),
        aggregation: this.get('aggregation')
      }
    };
  }

});
