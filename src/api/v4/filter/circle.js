var _ = require('underscore');
var Base = require('./base');
var CircleFilterModel = require('../../../windshaft/filters/circle');
var CartoValidationError = require('../error-handling/carto-validation-error');
var SpatialFilterTypes = require('./spatial-filter-types');

/**
 * Generic circle filter.
 *
 * When this filter is included into a dataview only the data inside a custom circle will be taken into account.
 *
 * You can manually set the circle properties with the `setCircle()`.
 *
 * This filter could be useful if you want give the users the ability to select a buffer around a point of interest in the map and update the dataviews accordingly.
 *
 * @fires circleChanged
 *
 * @constructor
 * @fires circleChanged
 * @extends carto.filter.Base
 * @memberof carto.filter
 * @api
 *
 */
function Circle () {
  this._internalModel = new CircleFilterModel();
  this.type = SpatialFilterTypes.CIRCLE;
}

Circle.prototype = Object.create(Base.prototype);

/**
 * Set the circle.
 *
 * @param {carto.filter.CircleData} circle
 * @fires circleChanged
 * @return {carto.filter.Circle} this
 * @api
 */
Circle.prototype.setCircle = function (circle) {
  this._checkCircle(circle);
  this._internalModel.setCircle(circle);
  this.trigger('circleChanged', circle);
  return this;
};

/**
 * Reset the circle.
 *
 * @fires circleChanged
 * @return {carto.filter.Circle} this
 * @api
 */
Circle.prototype.resetCircle = function () {
  return this.setCircle({ lat: 0, lng: 0, radius: 0 }); // TODO check null use?
};

/**
 * Return the current circle data
 *
 * @return {carto.filter.CircleData} Current circle data
 * @api
 */
Circle.prototype.getCircle = function () {
  /**
   * @typedef {object} carto.filter.CircleData
   * @property {number} lat - Center Latitude WGS84
   * @property {number} lng - Center Longitude WGS84
   * @property {number} radius - Radius in meters
   * @api
   */
  return this._internalModel.getCircle();
};

Circle.prototype._checkCircle = function (circle) {
  if (_.isUndefined(circle) ||
      _.isUndefined(circle.lat) ||
      _.isUndefined(circle.lng) ||
      _.isUndefined(circle.radius) ||
      !_.isNumber(circle.lat) ||
      !_.isNumber(circle.lng) ||
      !_.isNumber(circle.radius)) {
    throw new CartoValidationError('filter', 'invalidCircleObject');
  }
};

Circle.prototype.$getInternalModel = function () {
  return this._internalModel;
};

module.exports = Circle;
