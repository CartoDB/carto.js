var _ = require('underscore');
var DataviewModelBase = require('./dataview-model-base');
var SearchModel = require('./category-dataview/search-model');
var CategoryModelRange = require('./category-dataview/category-model-range');
var CategoriesCollection = require('./category-dataview/categories-collection');

/**
 * Category dataview model
 *
 * - It has several internal models/collections
 *   - search model: it manages category search results.
 */
module.exports = DataviewModelBase.extend({

  defaults: _.extend(
    {
      type: 'category',
      applyOwnFilter: false,
      allCategoryNames: [] // all (new + previously accepted), updated on data fetch (see parse)
    },
    DataviewModelBase.prototype.defaults
  ),

  initialize: function (attrs, opts) {
    DataviewModelBase.prototype.initialize.call(this, attrs, opts);

    // Internal model for calculating total amount of values in the category
    this._rangeModel = new CategoryModelRange({
      apiKey: this.get('apiKey'),
      authToken: this.get('authToken')
    });

    this._data = new CategoriesCollection(null, {
      aggregationModel: this
    });

    this._searchModel = new SearchModel({
      apiKey: this.get('apiKey'),
      authToken: this.get('authToken')
    }, {
      aggregationModel: this
    });

    this.on('change:column change:aggregation change:aggregation_column', this._reloadVisAndForceFetch, this);

    this.bind('change:url', function () {
      this._searchModel.set({
        url: this.get('url')
      });
    }, this);

    this.once('change:url', function () {
      this._rangeModel.setUrl(this.get('url'));
    }, this);

    this._rangeModel.bind('change:totalCount change:categoriesCount', function () {
      this.set({
        totalCount: this._rangeModel.get('totalCount'),
        categoriesCount: this._rangeModel.get('categoriesCount')
      });
    }, this);

    this._bindSearchModelEvents();
  },

  _getDataviewSpecificURLParams: function () {
    var params = [
      'own_filter=' + (this.get('applyOwnFilter') ? 1 : 0)
    ];
    return params;
  },

  _onMapBoundsChanged: function () {
    DataviewModelBase.prototype._onMapBoundsChanged.apply(this, arguments);
    this._searchModel.fetchIfSearchIsApplied();
  },

  _bindSearchModelEvents: function () {
    this._searchModel.bind('loading', function () {
      this.trigger('loading', this);
    }, this);
    this._searchModel.bind('loaded', function () {
      this.trigger('loaded', this);
    }, this);
    this._searchModel.bind('error', function (e) {
      if (!e || (e && e.statusText !== 'abort')) {
        this.trigger('error', this);
      }
    }, this);
    this._searchModel.bind('change:data', this._onSearchDataChange, this);
  },

  _onSearchDataChange: function () {
    this.trigger('change:searchData', this);
  },

  _shouldFetchOnBoundingBoxChange: function () {
    return DataviewModelBase.prototype._shouldFetchOnBoundingBoxChange.call(this) && !this.isSearchApplied();
  },

  enableOwnFilter: function () {
    this.set('applyOwnFilter', true);
  },

  disableOwnFilter: function () {
    this.set('applyOwnFilter', false);
  },

  // Search model helper methods //

  getSearchQuery: function () {
    return this._searchModel.getSearchQuery();
  },

  setSearchQuery: function (q) {
    this._searchModel.set('q', q);
  },

  isSearchValid: function () {
    return this._searchModel.isValid();
  },

  getSearchResult: function () {
    return this._searchModel.getData();
  },

  getSearchCount: function () {
    return this._searchModel.getCount();
  },

  applySearch: function () {
    this._searchModel.fetch();
  },

  isSearchApplied: function () {
    return this._searchModel.isSearchApplied();
  },

  cleanSearch: function () {
    this._searchModel.resetData();
  },

  setupSearch: function () {
    if (!this.isSearchApplied()) {
      this._searchModel.setData(
        this._data.toJSON()
      );
    }
  },

  getData: function () {
    return this._data;
  },

  getSize: function () {
    return this._data.size();
  },

  getCount: function () {
    return this.get('categoriesCount');
  },

  isOtherAvailable: function () {
    return this._data.isOtherAvailable();
  },

  refresh: function () {
    if (this.isSearchApplied()) {
      this._searchModel.fetch();
    } else {
      this.fetch();
    }
  },

  parse: function (d) {
    var newData = [];
    var allCategories = d.categories;
    var allCategoryNames = [];

    _.each(allCategories, function (datum) {
      // Category might be a non-string type (e.g. number), make sure it's always a string for concistency
      var category = String(datum.category);

      allCategoryNames.push(category);

      newData.push({
        name: category,
        agg: datum.agg,
        value: datum.value
      });
    }, this);

    this._data.reset(newData);

    return {
      allCategoryNames: _
        .chain(allCategoryNames)
        .unique()
        .value(),
      data: newData,
      nulls: d.nulls,
      min: d.min,
      max: d.max,
      count: d.count
    };
  },

  // Backbone toJson function override
  toJSON: function () {
    return {
      type: 'aggregation',
      source: { id: this.getSourceId() },
      options: {
        column: this.get('column'),
        aggregation: this.get('aggregation'),

        // TODO server-side is using camelCased attr name, update once fixed
        aggregationColumn: this.get('aggregation_column')
      }
    };
  }
},

  // Class props
{
  ATTRS_NAMES: DataviewModelBase.ATTRS_NAMES.concat([
    'column',
    'aggregation',
    'aggregation_column',
    'acceptedCategories'
  ])
}
);
