var Base = require('./base');
var LeafletBoundingBoxAdapter = require('../../../geo/adapters/leaflet-bounding-box-adapter');
var BoundingBoxFilterModel = require('../../../windshaft/filters/bounding-box');

/**
 * Bounding box filter for Leaflet maps.
 * 
 * When this filter is included into a dataview only the data inside the {@link http://leafletjs.com/reference-1.2.0.html#map|leafletMap}
 * bounds will be taken into account.
 *
 * @param {L.Map} map - The leaflet map view
 *
 * @fires carto.filter.BoundingBoxLeaflet.boundsChanged
 *
 * @constructor
 * @extends carto.filter.Base
 * @memberof carto.filter
 * @api
 * 
 * @example
 * // Create a bonding box attached to a leaflet map.
 * const bboxFilter = new carto.filter.BoundingBoxLeaflet(leafletMap);
 * // Add the filter to a dataview. Generating new data when the map bounds are changed.
 * dataview.addFilter(bboxFilter);
 */
function BoundingBoxLeaflet (map) {
  // Adapt the Leaflet map to offer unique:
  // - getBounds() function
  // - 'boundsChanged' event
  var mapAdapter = new LeafletBoundingBoxAdapter(map);
  // Use the adapter for the internal BoundingBoxFilter model
  this._internalModel = new BoundingBoxFilterModel(mapAdapter);
  this.listenTo(this._internalModel, 'boundsChanged', this._onBoundsChanged);
}

BoundingBoxLeaflet.prototype = Object.create(Base.prototype);

/**
 * Return the current bounds.
 *
 * @return {carto.filter.Bounds} Current bounds
 * @api
 */
BoundingBoxLeaflet.prototype.getBounds = function () {
  return this._internalModel.getBounds();
};

BoundingBoxLeaflet.prototype._onBoundsChanged = function (bounds) {
  this.trigger('boundsChanged', bounds);
};

BoundingBoxLeaflet.prototype.$getInternalModel = function () {
  return this._internalModel;
};

module.exports = BoundingBoxLeaflet;

/**
 * Event triggered when bounds of a bounding box filter for Leaflet changes.
 *
 * Contains a single {@link carto.filter.Bounds} argument with the new bounds.
 *
 * @event carto.filter.BoundingBoxLeaflet.boundsChanged
 * @type {carto.filter.Bounds}
 * @api
 */
