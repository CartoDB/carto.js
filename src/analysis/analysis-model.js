var _ = require('underscore');
var Backbone = require('backbone');
var Model = require('../core/model');
var util = require('../core/util');

var REQUIRED_OPTS = [
  'camshaftReference',
  'vis'
];

var STATUS = {
  PENDING: 'pending',
  WAITING: 'waiting',
  RUNNING: 'running',
  FAILED: 'failed',
  READY: 'ready'
};

var AnalysisModel = Model.extend({

  initialize: function (attrs, opts) {
    opts = opts || {};
    util.checkRequiredOpts(opts, REQUIRED_OPTS, 'AnalysisModel');

    this._camshaftReference = opts.camshaftReference;
    this._vis = opts.vis;
    this._filters = new Backbone.Collection();

    this._initBinds();
  },

  url: function () {
    var url = this.get('url');
    if (url) {
      if (this.get('apiKey')) {
        url += '?api_key=' + this.get('apiKey');
      } else if (this.get('authToken')) {
        var authToken = this.get('authToken');
        if (authToken instanceof Array) {
          var tokens = _.map(authToken, function (token) {
            return 'auth_token[]=' + token;
          });
          url += '?' + tokens.join('&');
        } else {
          url += '?auth_token=' + authToken;
        }
      }
      return url;
    }
  },

  setOk: function () {
    this.unset('error');
  },

  setError: function (error) {
    this.set({
      error: error,
      status: STATUS.FAILED
    });
  },

  _initBinds: function () {
    this.bind('change:type', function () {
      this.unbind(null, null, this);
      this._initBinds();
      this._reloadVis();
    }, this);

    _.each(this.getParamNames(), function (paramName) {
      this.bind('change:' + paramName, this._reloadVis, this);
    }, this);

    this.listenTo(this._filters, 'change', this._onFiltersChanged);
    this.listenTo(this._filters, 'destroy', this._onFilterDestroyed);
  },

  _reloadVis: function (opts) {
    opts = opts || {};
    opts.error = this._onMapReloadError.bind(this);
    this._vis.reload(opts);
  },

  _onMapReloadError: function () {
    this.set('status', STATUS.FAILED);
  },

  remove: function () {
    this.trigger('destroy', this);
    this.stopListening();
  },

  findAnalysisById: function (analysisId) {
    if (this.get('id') === analysisId) {
      return this;
    }
    var sources = _.chain(this._getSourceNames())
      .map(function (sourceName) {
        var source = this.get(sourceName);
        if (source) {
          return source.findAnalysisById(analysisId);
        }
      }, this)
      .compact()
      .value();

    return sources[0];
  },

  _getSourceNames: function () {
    return this._camshaftReference.getSourceNamesForAnalysisType(this.get('type'));
  },

  isDone: function () {
    return this._anyStatus(STATUS.READY, STATUS.FAILED);
  },

  isFailed: function () {
    return this._anyStatus(STATUS.FAILED);
  },

  isLoading: function () {
    return this._anyStatus(STATUS.PENDING, STATUS.WAITING, STATUS.RUNNING);
  },

  _anyStatus: function () {
    var list = Array.prototype.slice.call(arguments, 0);
    return list.indexOf(this.get('status')) !== -1;
  },

  toJSON: function () {
    var json = _.pick(this.attributes, 'id', 'type');
    json.params = _.pick(this.attributes, this.getParamNames());
    var sourceNames = this._getSourceNames();
    _.each(sourceNames, function (sourceName) {
      var source = {};
      var sourceInfo = this.get(sourceName);
      if (sourceInfo) {
        source[sourceName] = sourceInfo.toJSON();
        _.extend(json.params, source);
      }
    }, this);

    return json;
  },

  getParamNames: function () {
    return this._camshaftReference.getParamNamesForAnalysisType(this.get('type'));
  },

  // Filters
  addFilter: function (filter) {
    this._filters.add(filter);
  },

  getFilters: function () {
    return this._filters;
  },

  _onFiltersChanged: function () {
    this._reloadVis({
      reason: 'filtersChanged'
    });
  },

  _onFilterDestroyed: function (filter) {
    this._filters.remove(filter);
    this._onFiltersChanged();
  },

  /**
   * Compare two analysisModels.
   */
  equals: function (analysisModel) {
    if (!(analysisModel instanceof AnalysisModel)) {
      return false;
    }
    // Since all analysis are created using the analysisFactory different ids ensure different nodes.
    return this.get('id') === analysisModel.get('id');
  }
}, {
  STATUS: STATUS
});

module.exports = AnalysisModel;
