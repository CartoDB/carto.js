var _ = require('underscore');
var cartojss = require('cartojss');

function CartoCSS (input) {
  if (_.isString(input)) {
    this._style = input;
  } else if (_.isObject(input)) {
    this._style = cartojss.serialize(input);
  } else {
    throw new Error('Input style not valid: ' + input);
  }
}

CartoCSS.prototype.toString = function () {
  return this._style;
};

module.exports = CartoCSS;
