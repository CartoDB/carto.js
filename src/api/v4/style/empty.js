var Base = require('./base');

/**
 * An empty style that can be used in a {@link carto.layer.Layer} when working with MVT tiles.
 * @example
 * var style = new carto.style.Empty();
 *
 * @constructor
 * @extends carto.style.Base
 * @memberof carto.style
 * @api
 */
function Empty () {
}

Empty.prototype = Object.create(Base.prototype);

/**
 * Get the empty CartoCSS/TurboCarto style as a string.
 *
 * @return {string} - The empty style
 * @api
 */
Empty.prototype.getContent = function () {
  return undefined;
};

/**
 * Get the empty CartoCSS style version.
 *
 * @return {string} - The CartoCSS version
 * @api
 */
Empty.prototype.getVersion = function () {
  return undefined;
};

module.exports = Empty;
