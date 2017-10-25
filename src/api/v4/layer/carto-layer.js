var CartoDBLayer = require('../../../geo/map/cartodb-layer');

function CartoLayer (source, style, engine) {
  return new CartoDBLayer({ source: source, cartocss: style.toString() }, { engine: engine });
}

module.exports = CartoLayer;
