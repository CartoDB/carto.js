var _ = require('underscore');
var Backbone = require('backbone');
var status = require('../constants').status;
var SourceBase = require('../source/base');
var FilterBase = require('../filter/base');
var SQLFilterBase = require('../filter/base-sql');
var SpatialFilterTypes = require('../filter/spatial-filter-types');
var CartoError = require('../error-handling/carto-error');
var CartoValidationError = require('../error-handling/carto-validation-error');

/**
 * Base class for dataview objects.
 *
 * Dataviews are a way to extract data from a CARTO account in predefined ways
 * (eg: a list of categories, the result of a formula operation, etc.).
 *
 * **This object should not be used directly**
 *
 * The data used in a dataviews cames from a {@link carto.source.Base|source} that might change
 * due to different reasons (eg: SQL query changed).
 *
 * When dataview data changes the dataview will trigger events to notify subscribers when new data is available.
 *
 * @example
 * // Keep your widget data sync. Remember each dataview has his own data format.
 * dataview.on('dataChanged', newData => {
 *  renderWidget(newData);
 * })
 *
 * @constructor
 * @abstract
 * @memberof carto.dataview
 * @fires dataChanged
 * @fires columnChanged
 * @fires statusChanged
 * @fires error
 * @api
 */
function Base () { }

_.extend(Base.prototype, Backbone.Events);

/**
 * Return the current dataview status.
 *
 * @return {carto.dataview.status} Current dataview status
 * @api
 */
Base.prototype.getStatus = function () {
  return this._status;
};

/**
 * Return true is the current status is loading.
 *
 * @return {boolean}
 * @api
 */
Base.prototype.isLoading = function () {
  return this._status === status.LOADING;
};

/**
 * Return true is the current status is loaded.
 *
 * @return {boolean}
 * @api
 */
Base.prototype.isLoaded = function () {
  return this._status === status.LOADED;
};

/**
 * Return true is the current status is error.
 *
 * @return {boolean}
 * @api
 */
Base.prototype.hasError = function () {
  return this._status === status.ERROR;
};

/**
 * Enable the dataview. When enabled, a dataview fetches new data
 * when the map changes (changing map configuration or changing map
 * bounding box).
 *
 * @return {carto.dataview.Base} this
 * @api
 */
Base.prototype.enable = function () {
  return this._setEnabled(true);
};

/**
 * Disable the dataview. This stops the dataview from fetching new
 * data when there is a map change (like changing map configuration or changing map
 * bounding box).
 *
 * @return {carto.dataview.Base} this
 * @api
 */
Base.prototype.disable = function () {
  return this._setEnabled(false);
};

/**
 * Return true if the dataview is enabled.
 *
 * @return {boolean}
 * @api
 */
Base.prototype.isEnabled = function () {
  return this._enabled;
};

/**
 * Return the current source where the dataview gets the data from.
 *
 * @return {carto.source.Base} Current source object
 * @api
 */
Base.prototype.getSource = function () {
  return this._source;
};

/**
 * Set the dataview column.
 *
 * @param  {string} column
 * @fires columnChanged
 * @return {carto.dataview.Base} this
 * @api
 */
Base.prototype.setColumn = function (column) {
  this._checkColumn(column);
  this._column = column;
  if (this._internalModel) {
    this._internalModel.set('column', this._column);
  }
  return this;
};

/**
 * Return the current dataview column where the dataview is applied.
 *
 * @return {string} Current dataview column
 * @api
 */
Base.prototype.getColumn = function () {
  return this._column;
};

/**
 * Add a {@link carto.filter.Base|filter}.
 *
 * @param  {carto.filter.Base} filter
 * @return {carto.dataview.Base} this
 * @api
 */
Base.prototype.addFilter = function (filter) {
  this._checkFilter(filter);
  this._addSpatialFilter(filter);
  return this;
};

/**
 * Remove a {@link carto.filter.Base|filter}.
 *
 * @param  {carto.filter.Base} filter
 * @return {carto.dataview.Base} this
 * @api
 */
Base.prototype.removeFilter = function (filter) {
  this._checkFilter(filter);
  this._removeSpatialFilter(filter);
  return this;
};

/**
 * Check if a {@link carto.filter.Base|filter} exists in the dataview.
 *
 * @param  {carto.filter.Base} filter
 * @return {carto.dataview.Base} this
 * @api
 */
Base.prototype.hasFilter = function (filter) {
  this._checkFilter(filter);
  var hasBBoxFilter = (filter === this._boundingBoxFilter) &&
    (this._internalModel && this._internalModel.get('sync_on_bbox_change'));

  var hasCircleFilter = (filter === this._circleFilter) &&
    (this._internalModel && this._internalModel.get('sync_on_circle_change'));

  var hasPolygonFilter = (filter === this._polygonFilter) &&
    (this._internalModel && this._internalModel.get('sync_on_polygon_change'));

  return hasBBoxFilter || hasCircleFilter || hasPolygonFilter;
};

Base.prototype.getData = function () {
  throw new Error('getData must be implemented by the particular dataview.');
};

// Protected methods

Base.prototype.DEFAULTS = {};

/**
 * Initialize dataview.
 *
 * @param {carto.source.Base} source - The source where the dataview will fetch the data
 * @param {string} column - The column name to get the data
 * @param  {object} options - It depends on the instance
 */
Base.prototype._initialize = function (source, column, options) {
  options = _.defaults(options || {}, this.DEFAULTS);

  this._checkSource(source);
  this._checkColumn(column);
  this._checkOptions(options);

  this._source = source;
  this._column = column;
  this._options = options;

  this._status = status.NOT_LOADED;
  this._enabled = true;
  this._boundingBoxFilter = null;
};

Base.prototype._checkSource = function (source) {
  if (!(source instanceof SourceBase)) {
    throw this._getValidationError('sourceRequired');
  }
};

Base.prototype._checkColumn = function (column) {
  if (_.isUndefined(column)) {
    throw this._getValidationError('columnRequired');
  }
  if (!_.isString(column)) {
    throw this._getValidationError('columnString');
  }
  if (_.isEmpty(column)) {
    throw this._getValidationError('emptyColumn');
  }
};

Base.prototype._checkOptions = function (options) {
  throw new Error('_checkOptions must be implemented by the particular dataview.');
};

Base.prototype._checkFilter = function (filter) {
  if (!(filter instanceof FilterBase) || filter instanceof SQLFilterBase) {
    throw this._getValidationError('filterRequired');
  }
};

Base.prototype._createInternalModel = function (engine) {
  throw new Error('_createInternalModel must be implemented by the particular dataview.');
};

Base.prototype._setEnabled = function (enabled) {
  this._enabled = enabled;
  if (this._internalModel) {
    this._internalModel.set('enabled', enabled);
  }
  return this;
};

Base.prototype._listenToInternalModelSharedEvents = function () {
  if (this._internalModel) {
    this.listenTo(this._internalModel, 'change:data', this._onDataChanged);
    this.listenTo(this._internalModel, 'change:column', this._onColumnChanged);
    this.listenTo(this._internalModel, 'loading', this._onStatusLoading);
    this.listenTo(this._internalModel, 'loaded', this._onStatusLoaded);
    this.listenTo(this._internalModel, 'statusError', this._onStatusError);
  }
};

Base.prototype._onDataChanged = function () {
  this.trigger('dataChanged', this.getData());
};

Base.prototype._onColumnChanged = function () {
  if (this._internalModel) {
    this._column = this._internalModel.get('column');
  }
  this.trigger('columnChanged', this._column);
};

Base.prototype._onStatusLoading = function () {
  this._status = status.LOADING;
  this.trigger('statusChanged', this._status);
};

Base.prototype._onStatusLoaded = function () {
  this._status = status.LOADED;
  this.trigger('statusChanged', this._status);
};

Base.prototype._onStatusError = function (model, error) {
  this._status = status.ERROR;
  this.trigger('statusChanged', this._status, error);
  this._triggerError(this, error);
};

Base.prototype._changeProperty = function (key, value, internalKey) {
  var prevValue = this['_' + key];
  this['_' + key] = value;
  if (prevValue === value) {
    return;
  }
  this._triggerChange(key, value);
  if (this._internalModel) {
    this._internalModel.set(internalKey || key, value);
  }
};

Base.prototype._changeProperties = function (properties) {
  _.each(properties, (value, key) => {
    const prevValue = this[`_${key}`];

    if (prevValue !== value) {
      this[`_${key}`] = value;
      this._triggerChange(key, value);
    }
  });

  if (this._internalModel) {
    this._internalModel.set(properties);
  }
};

Base.prototype._triggerChange = function (key, value) {
  this.trigger(key + 'Changed', value);
};

/**
 * Fire a CartoError event from a internalDataviewError.
 */
Base.prototype._triggerError = function (model, internalDataviewError) {
  this.trigger('error', new CartoError(internalDataviewError));
};

Base.prototype._addSpatialFilter = function (spatialFilter) {
  switch (spatialFilter.type) {
    case SpatialFilterTypes.BBOX:
      this._addBoundingBoxFilter(spatialFilter);
      break;
    case SpatialFilterTypes.CIRCLE:
      this._addCircleFilter(spatialFilter);
      break;
    case SpatialFilterTypes.POLYGON:
      this._addPolygonFilter(spatialFilter);
      break;
    default:
      throw new Error('The filter is not a valid spatial filter.');
  }
};

Base.prototype._removeSpatialFilter = function (spatialFilter) {
  switch (spatialFilter.type) {
    case SpatialFilterTypes.BBOX:
      if (spatialFilter === this._boundingBoxFilter) {
        this._removeBoundingBoxFilter();
      }
      break;
    case SpatialFilterTypes.CIRCLE:
      if (spatialFilter === this._circleFilter) {
        this._removeCircleFilter();
      }
      break;
    case SpatialFilterTypes.POLYGON:
      if (spatialFilter === this._polygonFilter) {
        this._removePolygonFilter();
      }
      break;
    default:
      throw new Error('The filter is not a valid spatial filter.');
  }
};

Base.prototype._addBoundingBoxFilter = function (bboxFilter) {
  if (bboxFilter === this._boundingBoxFilter) {
    return;
  }

  this._boundingBoxFilter = bboxFilter;
  if (this._internalModel) {
    this._internalModel.addBBoxFilter(this._boundingBoxFilter.$getInternalModel());
    this._internalModel.set('sync_on_bbox_change', true);
  }
};

Base.prototype._removeBoundingBoxFilter = function () {
  this._boundingBoxFilter = null;
  if (this._internalModel) {
    this._internalModel.removeBBoxFilter();
    this._internalModel.set('sync_on_bbox_change', false);
  }
};

Base.prototype._addCircleFilter = function (circleFilter) {
  if (circleFilter === this._circleFilter) {
    return;
  }

  this._circleFilter = circleFilter;
  if (this._internalModel) {
    this._internalModel.addCircleFilter(this._circleFilter.$getInternalModel());
    this._internalModel.set('sync_on_circle_change', true);
  }
};

Base.prototype._removeCircleFilter = function () {
  this._circleFilter = null;
  if (this._internalModel) {
    this._internalModel.removeCircleFilter();
    this._internalModel.set('sync_on_circle_change', false);
  }
};

Base.prototype._addPolygonFilter = function (polygonFilter) {
  if (polygonFilter === this._polygonFilter) {
    return;
  }

  this._polygonFilter = polygonFilter;
  if (this._internalModel) {
    this._internalModel.addPolygonFilter(this._polygonFilter.$getInternalModel());
    this._internalModel.set('sync_on_polygon_change', true);
  }
};

Base.prototype._removePolygonFilter = function () {
  this._polygonFilter = null;
  if (this._internalModel) {
    this._internalModel.removePolygonFilter();
    this._internalModel.set('sync_on_polygon_change', false);
  }
};

Base.prototype._getValidationError = function (code) {
  return new CartoValidationError('dataview', code);
};

// Internal public methods

Base.prototype.$setEngine = function (engine) {
  this._source.$setEngine(engine);
  if (!this._internalModel) {
    this._createInternalModel(engine);
    this._listenToInternalModelSharedEvents();
  }
};

Base.prototype.$getInternalModel = function () {
  return this._internalModel;
};

module.exports = Base;

/**
 * Fired when the column name has changed. Handler gets a parameter with the new column name.
 *
 * @event columnChanged
 * @type {string}
 * @api
 */

/**
 * Fired when the status has changed. Handler gets a parameter with the new status.
 *
 * Contains a single argument with the new status.
 *
 * @event statusChanged
 * @type {carto.dataview.status}
 * @api
 */

/**
 * Fired when the data has changed. Handler gets an object with specific data for the type
 * of dataview that triggered the event.
 *
 * @event dataChanged
 * @type {carto.dataview.CategoryData|carto.dataview.FormulaData|carto.dataview.HistogramData|carto.dataview.TimeSeriesData}
 * @api
 */
