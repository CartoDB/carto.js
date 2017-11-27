var _ = require('underscore');
var Base = require('./base');
var AnalysisModel = require('../../../analysis/analysis-model');
var CamshaftReference = require('../../../analysis/camshaft-reference');

/**
 * A SQL Query that can be used as the data source for layers and dataviews.
 *
 * @param {string} query A SQL query containing a SELECT statement
 * @example
 * new carto.source.SQL('SELECT * FROM european_cities');
 * @constructor
 * @extends carto.source.Base
 * @memberof carto.source
 * @fires carto.source.SQL.queryChangedEvent
 * @api
 */
function SQL (query, auth) {
  _checkQuery(query);
  // TODO: check auth

  this._query = query;

  Base.apply(this, arguments);

  this._internalModel = new AnalysisModel({
    id: this.getId(),
    type: 'source',
    query: query
  }, {
    camshaftReference: CamshaftReference,
    engine: auth._engine
  });

  this._internalModel.on('change:error', this._triggerError, this);
}

SQL.prototype = Object.create(Base.prototype);

/**
 * Store the query internally and if in the internal model when exists.
 *
 * @param {string} query - The sql query that will be the source of the data
 * @fires carto.source.SQL.queryChangedEvent
 * @api
 */
SQL.prototype.setQuery = function (query) {
  _checkQuery(query);
  this._query = query;
  this._internalModel.set('query', query);
  return this;
};

/**
 * Get the query being used in this SQL source.
 *
 * @return {string} The query being used in this SQL object
 * @api
 */
SQL.prototype.getQuery = function () {
  return this._query;
};

/**
 * Triggered every time the query is changed.
 * Contains a string with the new query.
 *
 * @event carto.source.SQL.queryChangedEvent
 * @type {string}
 * @api
 */
SQL.prototype._triggerQueryChanged = function (model, value) {
  this.trigger('queryChanged', value);
};

function _checkQuery (query) {
  if (!query) {
    throw new TypeError('query is required.');
  }

  if (!_.isString(query)) {
    throw new Error('query must be a string.');
  }
}

module.exports = SQL;
