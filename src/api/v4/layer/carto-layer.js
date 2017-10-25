var CartoDBLayer = require('../../../geo/map/cartodb-layer');

function CartoLayer (source, style, engine) {
  return new CartoDBLayer({ source: source, cartocss: style }, { engine: engine });
}

module.exports = CartoLayer;
