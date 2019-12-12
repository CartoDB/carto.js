var _ = require('underscore');
var Base = require('./base');
var PolygonFilterModel = require('../../../windshaft/filters/polygon');
var CartoValidationError = require('../error-handling/carto-validation-error');
var SpatialFilterTypes = require('./spatial-filter-types');

/**
 * Generic polygon filter.
 *
 * When this filter is included into a dataview only the data inside a custom polygon will be taken into account.
 *
 * You can manually set the polygon with the `setPolygon()`.
 *
 * This filter could be useful if you want give the users the ability to select a custom area in the map and update the dataviews accordingly.
 *
 * @fires polygonChanged
 *
 * @constructor
 * @fires polygonChanged
 * @extends carto.filter.Base
 * @memberof carto.filter
 * @api
 *
 */
function Polygon () {
  this._internalModel = new PolygonFilterModel();
  this.type = SpatialFilterTypes.POLYGON;
}

Polygon.prototype = Object.create(Base.prototype);

/**
 * Set the polygon.
 *
 * @param {carto.filter.PolygonData} polygon
 * @fires polygonChanged
 * @return {carto.filter.Polygon} this
 * @api
 */
Polygon.prototype.setPolygon = function (polygon) {
  this._checkPolygon(polygon);
  this._internalModel.setPolygon(polygon);
  this.trigger('polygonChanged', polygon);
  return this;
};

/**
 * Reset the polygon.
 *
 * @fires polygonChanged
 * @return {carto.filter.Polygon} this
 * @api
 */
Polygon.prototype.resetPolygon = function () {
  return this.setPolygon({
    type: 'Polygon',
    coordinates: []
  });
};

/**
 * Return the current polygon data
 *
 * @return {carto.filter.PolygonData} Current polygon data, expressed as a GeoJSON geometry fragment
 * @api
 */
Polygon.prototype.getPolygon = function () {
  /**
   * @typedef {object} carto.filter.PolygonData
   * @property {string} type - Geometry type, Just 'Polygon' is valid
   * @property {Array.<number[]>} coordinates - Array of coordinates [lng, lat] as defined in GeoJSON geometries
   * @api
   */
  return this._internalModel.getPolygon();
};

Polygon.prototype._checkPolygon = function (polygon) {
  if (_.isUndefined(polygon) ||
      _.isUndefined(polygon.type) ||
      _.isUndefined(polygon.coordinates) ||
      !_.isString(polygon.type) ||
      !_.isArray(polygon.coordinates) ||
      polygon.type !== 'Polygon') {
    throw new CartoValidationError('filter', 'invalidPolygonObject');
  }
};

Polygon.prototype.$getInternalModel = function () {
  return this._internalModel;
};

module.exports = Polygon;
