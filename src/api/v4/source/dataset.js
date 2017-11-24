var _ = require('underscore');
var Base = require('./base');
var AnalysisModel = require('../../../analysis/analysis-model');
var CamshaftReference = require('../../../analysis/camshaft-reference');

/**
 * A Dataset that can be used as the data source for layers and dataviews.
 *
 * @param {string} tableName The name of an existing table
 * @example
 * new carto.source.Dataset('european_cities');
 * @constructor
 * @extends carto.source.Base
 * @memberof carto.source
 * @api
 */
function Dataset (tableName, auth) {
  _checkTableName(tableName);
  // TODO: check auth

  this._tableName = tableName;

  Base.apply(this, arguments);

  this._internalModel = new AnalysisModel({
    id: this.getId(),
    type: 'source',
    query: 'SELECT * from ' + tableName
  }, {
    camshaftReference: CamshaftReference,
    engine: auth._engine
  });

  this._internalModel.on('change:error', this._triggerError, this);
}

Dataset.prototype = Object.create(Base.prototype);

/**
 * Return the table name being used in  this Dataset object.
 *
 * @return {string} The table name being used in  this Dataset object
 * @api
 */
Dataset.prototype.getTableName = function () {
  return this._tableName;
};

function _checkTableName (tableName) {
  if (_.isUndefined(tableName)) {
    throw new TypeError('Table name is required.');
  }
  if (!_.isString(tableName)) {
    throw new TypeError('Table name must be a string.');
  }
  if (_.isEmpty(tableName)) {
    throw new TypeError('Table name must be not empty.');
  }
}

module.exports = Dataset;
