var Base = require('./base');
var CartoDBLayer = require('../../../geo/map/cartodb-layer');
var SourceBase = require('../source/base');
var StyleBase = require('../style/base');
var CartoError = require('../error');
/**
 * Represent a layer Object.
 *
 * @param {object} source - The source where the layer will fetch the data
 * @param {carto.style.CartoCSS} style - A CartoCSS object with the layer styling
 * @param {object} [options]
 * @param {Array<string>} [options.featureClickColumns=[]] - Columns that will be available for `featureClick` events
 * @param {Array<string>} [options.featureOverColumns=[]] - Columns that will be available for `featureOver` events
 * @fires carto.layer.Layer.FeatureEvent
 * @fires carto.layer.Layer.sourceChanged
 * @fires carto.layer.Layer.styleChanged
 * @example
 * // no options
 * new carto.layer.Layer(citiesSource, citiesStyle);
 * @example
 * // with options
 * new carto.layer.Layer(citiesSource, citiesStyle, {
 *   featureClickColumns: [ 'name', 'population' ],
 *   featureOverColumns: [ 'name' ]
 * });
 * @constructor
 * @extends carto.layer.Base
 * @memberof carto.layer
 * @api
 */
function Layer (source, style, options) {
  options = options || {};

  _checkSource(source);
  _checkStyle(style);

  Base.apply(this, arguments);

  this._source = source;
  this._style = style;
  this._visible = true;
  this._featureClickColumns = options.featureClickColumns || [];
  this._featureOverColumns = options.featureOverColumns || [];

  this._internalModel = new CartoDBLayer({
    id: this.getId(),
    source: source.$getInternalModel(),
    cartocss: style.toCartoCSS(),
    visible: this._visible,
    infowindow: _getInteractivityFields(this._featureClickColumns),
    tooltip: _getInteractivityFields(this._featureOverColumns)
  }, {
    engine: source.$getEngine()
  });

  this._internalModel.on('change:error', function (model, value) {
    if (value && _isStyleError(value)) {
      this._style.$setError(new CartoError(value));
    }
  }, this);
}

Layer.prototype = Object.create(Base.prototype);

/**
 * Set a new style for this layer.
 *
 * @param {carto.style.CartoCSS} style - New style
 * @fires carto.layer.Layer.styleChanged
 * @return {carto.layer.Layer} this
 *
 * @api
 */
Layer.prototype.setStyle = function (style) {
  if (this._style !== style) {
    _checkStyle(style);
    this._style = style;
    this._internalModel.set('cartocss', style.toCartoCSS());
    this.trigger('styleChanged', this);
  }
  return this;
};

/**
 * Get the current style for this layer.
 *
 * @return {carto.style.CartoCSS} Current style
 * @api
 */
Layer.prototype.getStyle = function () {
  return this._style;
};

/**
 * Set a new source for this layer.
 *
 * A source and a layer must belong to the same client so you can't
 * add a source belonging to a different client.
 *
 * @param {carto.source.Dataset|carto.source.SQL} source - New source
 * @fires carto.layer.Layer.sourceChanged
 * @return {carto.layer.Layer} this
 * @api
 */
Layer.prototype.setSource = function (source) {
  if (this._source !== source) {
    _checkSource(source);
    this._source = source;
    this._internalModel.set('source', source.$getInternalModel());
    this.trigger('sourceChanged', this);
  }
  return this;
};

/**
 * Get the current source for this layer.
 *
 * @return {carto.source.Dataset|carto.source.SQL} Current source
 * @api
 */
Layer.prototype.getSource = function () {
  return this._source;
};

/**
 * Set new columns for featureClick events.
 *
 * @param {Array<string>} columns An array containing column names
 * @return {carto.layer.Layer} this
 * @api
 */
Layer.prototype.setFeatureClickColumns = function (columns) {
  this._featureClickColumns = columns;
  this._internalModel.infowindow.update(_getInteractivityFields(columns));

  return this;
};

/**
 * Get the columns available in featureClicked events.
 *
 * @return  {Array<string>} Column names available in featureClicked events
 * @api
 */
Layer.prototype.getFeatureClickColumns = function (columns) {
  return this._featureClickColumns;
};

Layer.prototype.hasFeatureClickColumns = function (columns) {
  return this.getFeatureClickColumns().length > 0;
};

/**
 * Set new columns for featureOver events.
 *
 * @param {Array<string>} columns An array containing column names
 * @return {carto.layer.Layer} this
 * @api
 */
Layer.prototype.setFeatureOverColumns = function (columns) {
  this._featureOverColumns = columns;
  this._internalModel.tooltip.update(_getInteractivityFields(columns));

  return this;
};

/**
 * Get the columns available in featureOver events.
 *
 * @return  {Array<string>} Column names available in featureOver events
 * @api
 */
Layer.prototype.getFeatureOverColumns = function (columns) {
  return this._featureOverColumns;
};

Layer.prototype.hasFeatureOverColumns = function (columns) {
  return this.getFeatureOverColumns().length > 0;
};

/**
 * Hides the layer.
 *
 * @return {carto.layer.Layer} this
 * @api
 */
Layer.prototype.hide = function () {
  if (this._visible) {
    this._visible = false;
    this._internalModel.set('visible', false);
    this.trigger('visibilityChanged', false);
  }
  return this;
};

/**
 * Shows the layer.
 *
 * @return {carto.layer.Layer} this
 * @api
 */
Layer.prototype.show = function () {
  if (!this._visible) {
    this._visible = true;
    this._internalModel.set('visible', true);
    this.trigger('visibilityChanged', false);
  }
  return this;
};

/**
 * Change the layer's visibility.
 *
 * @return {carto.layer.Layer} this
 */
Layer.prototype.toggle = function () {
  return this.isVisible() ? this.hide() : this.show();
};

/**
 * Return true if the layer is visible and false when not visible.
 *
 * @return {boolean} - A boolean value indicating the layer's visibility
 * @api
 */
Layer.prototype.isVisible = function () {
  return this._visible;
};

/**
 * Return `true` if the layer is not visible and false when visible.
 *
 * @return {boolean} - A boolean value indicating the layer's visibility
 * @api
 */
Layer.prototype.isHidden = function () {
  return !this.isVisible();
};

// Scope functions

/**
 * Transform the columns array into the format expected by the CartoDBLayer.
 */
function _getInteractivityFields (columns) {
  var fields = columns.map(function (column, index) {
    return {
      name: column,
      title: true,
      position: index
    };
  });

  return {
    fields: fields
  };
}

function _checkStyle (style) {
  if (!(style instanceof StyleBase)) {
    throw new TypeError('The given object is not a valid style. See "carto.style.Base"');
  }
}

function _checkSource (source) {
  if (!(source instanceof SourceBase)) {
    throw new TypeError('The given object is not a valid source. See "carto.source.Base"');
  }
}

/**
 * Return true when a windshaft error is because a styling error.
 */
function _isStyleError (windshaftError) {
  return windshaftError.message && windshaftError.message.indexOf('style') === 0;
}

/**
 * @typedef {Object} LatLng
 * @property {number} lat - Latitude
 * @property {number} lng - Longitude
 *
 * @api
 */

/**
 * Event triggered when the source of the layer changes.
 *
 * Contains a single argument with the Layer where the source has changed.
 *
 * @event carto.layer.Layer.sourceChanged
 * @type {carto.layer.Layer}
 * @api
 */

/**
 * Event triggered when the style of the layer changes.
 *
 * Contains a single argument with the Layer where the style has changed.
 *
 * @event carto.layer.Layer.styleChanged
 * @type {carto.layer.Layer}
 * @api
 */

module.exports = Layer;
