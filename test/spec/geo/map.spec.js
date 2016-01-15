var config = require('cdb.config');
var PlainLayer = require('../../../src/geo/map/plain-layer');
var Map = require('../../../src/geo/map');
var CartoDBLayer = require('../../../src/geo/map/cartodb-layer');
var TorqueLayer = require('../../../src/geo/map/torque-layer');
var CartoDBLayerGroupAnonymous = require('../../../src/geo/map/cartodb-layer-group-anonymous');
var CartoDBLayerGroupNamed = require('../../../src/geo/map/cartodb-layer-group-named');

describe('core/geo/map', function() {
  var map;

  beforeEach(function() {
    map = new Map();
  });

  it("should raise only one change event on setBounds", function() {
    var c = 0;
    map.bind('change:view_bounds_ne', function() {
      c++;
    });
    map.setBounds([[1,2],[1,2]]);
    expect(c).toEqual(1);
  });

  it("should not change center or zoom when the bounds are not ok", function() {
    var c = 0;
    map.bind('change:center', function() {
      c++;
    });
    map.setBounds([[1,2],[1,2]]);
    expect(c).toEqual(0);
  });

  it("should not change bounds when map size is 0", function() {
    map.set('zoom', 10);
    var bounds = [[43.100982876188546, 35.419921875], [60.23981116999893, 69.345703125]]
    map.fitBounds(bounds, {x: 0, y: 0});
    expect(map.get('zoom')).toEqual(10);
  });

  it("should adjust zoom to layer", function() {
    expect(map.get('maxZoom')).toEqual(40);
    expect(map.get('minZoom')).toEqual(0);

    var layer = new PlainLayer({ minZoom: 5, maxZoom: 20 });
    map.layers.reset(layer);
    expect(map.get('maxZoom')).toEqual(20);
    expect(map.get('minZoom')).toEqual(5);

    var layer = new PlainLayer({ minZoom: "7", maxZoom: "31" });
    map.layers.reset(layer);
    expect(map.get('maxZoom')).toEqual(31);
    expect(map.get('minZoom')).toEqual(7);
  });

  it("shouldn't set a NaN zoom", function() {
    var layer = new PlainLayer({ minZoom: NaN, maxZoom: NaN });
    map.layers.reset(layer);
    expect(map.get('maxZoom')).toEqual(40);
    expect(map.get('minZoom')).toEqual(0);
  });

  it('should update the attributions of the map when layers are reset/added/removed', function() {
    map = new Map();

    // Map has the default CartoDB attribution
    expect(map.get('attribution')).toEqual([
      "CartoDB <a href=\"http://cartodb.com/attributions\" target=\"_blank\">attribution</a>"
    ]);

    var layer1 = new CartoDBLayer({ attribution: 'attribution1' });
    var layer2 = new CartoDBLayer({ attribution: 'attribution1' });
    var layer3 = new CartoDBLayer({ attribution: 'wadus' });
    var layer4 = new CartoDBLayer({ attribution: '' });

    map.layers.reset([ layer1, layer2, layer3, layer4 ]);

    // Attributions have been updated removing duplicated and empty attributions
    expect(map.get('attribution')).toEqual([
      "attribution1",
      "wadus",
      "CartoDB <a href=\"http://cartodb.com/attributions\" target=\"_blank\">attribution</a>",
    ]);

    var layer = new CartoDBLayer({ attribution: 'attribution2' });

    map.layers.add(layer);

    // The attribution of the new layer has been appended before the default CartoDB attribution
    expect(map.get('attribution')).toEqual([
      "attribution1",
      "wadus",
      "attribution2",
      "CartoDB <a href=\"http://cartodb.com/attributions\" target=\"_blank\">attribution</a>",
    ]);

    layer.set('attribution', 'new attribution');

    // The attribution of the layer has been updated in the map
    expect(map.get('attribution')).toEqual([
      "attribution1",
      "wadus",
      "new attribution",
      "CartoDB <a href=\"http://cartodb.com/attributions\" target=\"_blank\">attribution</a>",
    ]);

    map.layers.remove(layer);

    expect(map.get('attribution')).toEqual([
      "attribution1",
      "wadus",
      "CartoDB <a href=\"http://cartodb.com/attributions\" target=\"_blank\">attribution</a>",
    ]);

    // Addind a layer with the default attribution
    var layer = new CartoDBLayer();

    map.layers.add(layer, { at: 0 });

    // Default CartoDB only appears once and it's the last one
    expect(map.get('attribution')).toEqual([
      "attribution1",
      "wadus",
      "CartoDB <a href=\"http://cartodb.com/attributions\" target=\"_blank\">attribution</a>",
    ]);
  })

  describe('.getInteractiveLayers', function () {
    it('should return layers inside of a layergroup layer model', function () {
      map = new Map();
      var cartodbLayer1 = new CartoDBLayer();
      var cartodbLayer2 = new CartoDBLayer();

      var layerGroup = new CartoDBLayerGroupAnonymous(null, {
        layers: [cartodbLayer1, cartodbLayer2]
      });

      map.layers.reset([layerGroup]);

      var interactiveLayers = map.getInteractiveLayers();
      expect(interactiveLayers.size()).toEqual(2);
      expect(interactiveLayers.at(0)).toEqual(cartodbLayer1);
      expect(interactiveLayers.at(1)).toEqual(cartodbLayer2);
    });

    it('should return layers inside of a namedmap layer model', function () {
      map = new Map();
      var cartodbLayer1 = new CartoDBLayer();
      var cartodbLayer2 = new CartoDBLayer();

      var layerGroup = new CartoDBLayerGroupNamed(null, {
        layers: [cartodbLayer1, cartodbLayer2]
      });

      map.layers.reset([layerGroup]);

      var interactiveLayers = map.getInteractiveLayers();
      expect(interactiveLayers.size()).toEqual(2);
      expect(interactiveLayers.at(0)).toEqual(cartodbLayer1);
      expect(interactiveLayers.at(1)).toEqual(cartodbLayer2);
    });

    it('should return torque layers', function () {
      map = new Map();
      var torqueLayer = new TorqueLayer();

      var layerGroup = new CartoDBLayerGroupNamed(null, {
        layers: [torqueLayer]
      });

      map.layers.reset([layerGroup]);

      var interactiveLayers = map.getInteractiveLayers();
      expect(interactiveLayers.size()).toEqual(1);
      expect(interactiveLayers.at(0)).toEqual(torqueLayer);
    });
  });

  describe('.getLayerGroup', function () {
    it('should NOT return the layer group', function () {
      map = new Map();

      expect(map.getLayerGroup()).toBeUndefined();

      var torqueLayer = new TorqueLayer();
      map.layers.reset([torqueLayer]);

      expect(map.getLayerGroup()).toBeUndefined();
    });

    it('should return a CartoDBLayerGroupAnonymous layergroup', function () {
      map = new Map();
      var cartodbLayer1 = new CartoDBLayer();
      var cartodbLayer2 = new CartoDBLayer();

      var layerGroup = new CartoDBLayerGroupAnonymous(null, {
        layers: [cartodbLayer1, cartodbLayer2]
      });

      map.layers.reset([layerGroup]);

      expect(map.getLayerGroup()).toEqual(layerGroup);
    });

    it('should return a CartoDBLayerGroupNamed layergroup', function () {
      map = new Map();
      var cartodbLayer1 = new CartoDBLayer();
      var cartodbLayer2 = new CartoDBLayer();

      var layerGroup = new CartoDBLayerGroupNamed(null, {
        layers: [cartodbLayer1, cartodbLayer2]
      });

      map.layers.reset([layerGroup]);

      expect(map.getLayerGroup()).toEqual(layerGroup);
    });
  });
});
