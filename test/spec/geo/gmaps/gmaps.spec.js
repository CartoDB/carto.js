var $ = require('jquery');
var _ = require('underscore');
var L = require('leaflet');
var Backbone = require('backbone');

var Map = require('cdb/geo/map');
var GoogleMapsMapView = require('cdb/geo/gmaps/gmaps-map-view');
var TileLayer = require('cdb/geo/map/tile-layer');
var GMapsTiledLayerView = require('cdb/geo/gmaps/gmaps-tiled-layer-view');
var CartoDBLayer = require('cdb/geo/map/cartodb-layer');
var CartoDBLayerGroupAnonymous = require('cdb/geo/map/cartodb-layer-group-anonymous');
var CartoDBLayerGroupNamed = require('cdb/geo/map/cartodb-layer-group-named');
var PlainLayer = require('cdb/geo/map/plain-layer');
var GMapsCartoDBLayerGroupView = require('cdb/geo/gmaps/gmaps-cartodb-layer-group-view');
var GMapsPlainLayerView = require('cdb/geo/gmaps/gmaps-plain-layer-view');
var Geometry = require('cdb/geo/geometry');
var GmapsPathView = require('cdb/geo/gmaps/gmaps-path-view');

describe('geo/gmaps/gmaps-map-view', function() {
  var mapView;
  var map;
  var spy;
  var container;
  beforeEach(function() {
    container = $('<div>').css('height', '200px');
    map = new Map();
    mapView = new GoogleMapsMapView({
      el: container,
      map: map
    });

    layerURL = 'http://localhost/{s}/light_nolabels/{z}/{x}/{y}.png';
    layer = new TileLayer({ urlTemplate: layerURL });

    spy = jasmine.createSpyObj('spy', ['zoomChanged', 'centerChanged', 'scrollWheelChanged']);
    map.bind('change:zoom', spy.zoomChanged);
    map.bind('change:center', spy.centerChanged);
    map.bind('change:scrollwheel', spy.scrollWheelChanged);
  });

  it("should change bounds when center is set", function() {
    var spy = jasmine.createSpy('change:view_bound_ne');
    spyOn(map, 'getViewBounds');
    map.bind('change:view_bounds_ne', spy);
    map.set('center', [10, 10]);
    expect(spy).toHaveBeenCalled()
    expect(map.getViewBounds).not.toHaveBeenCalled();
  });

  it("should change center and zoom when bounds are changed", function(done) {
    var spy = jasmine.createSpy('change:center');
    mapView.getSize = function() { return {x: 200, y: 200}; }
    map.bind('change:center', spy);
    spyOn(mapView, '_setCenter');
    mapView._bindModel();

    map.set({
      'view_bounds_ne': [1, 1],
      'view_bounds_sw': [-0.3, -1.2]
    });

    setTimeout(function() {
      expect(mapView._setCenter).toHaveBeenCalled();
      done();
    }, 1000);
  });

  it("should allow to disable the scroll wheel", function() {
    map.disableScrollWheel();
    expect(spy.scrollWheelChanged).toHaveBeenCalled();
    expect(map.get("scrollwheel")).toEqual(false);
  });

  it("should change zoom", function() {
    mapView._setZoom(null, 10);
    expect(spy.zoomChanged).toHaveBeenCalled();
  });

  it("should allow adding a layer", function() {
    map.addLayer(layer);
    expect(map.layers.length).toEqual(1);
  });

  it("should add layers on reset", function() {
    map.layers.reset([
      layer
    ]);
    expect(map.layers.length).toEqual(1);
  });

  it("should create a layer view when adds a model", function() {
    var spy = { c: function() {} };
    spyOn(spy, 'c');
    mapView.bind('newLayerView', spy.c);
    map.addLayer(layer);
    expect(map.layers.length).toEqual(1);
    expect(_.size(mapView.layers)).toEqual(1);
    expect(spy.c).toHaveBeenCalled();
  });

  it("should allow removing a layer", function() {
    map.addLayer(layer);
    map.removeLayer(layer);
    expect(map.layers.length).toEqual(0);
    expect(_.size(mapView.layers)).toEqual(0);
  });

  it("should allow removing a layer by index", function() {
    map.addLayer(layer);
    map.removeLayerAt(0);
    expect(map.layers.length).toEqual(0);
  });

  it("should allow removing a layer by Cid", function() {
    var cid = map.addLayer(layer);
    map.removeLayerByCid(cid);
    expect(map.layers.length).toEqual(0);
  });

  it("should create a TiledLayerView when the layer is Tiled", function() {
    var lyr = map.addLayer(layer);
    var layerView = mapView.getLayerByCid(lyr);
    expect(GMapsTiledLayerView.prototype.isPrototypeOf(layerView)).toBeTruthy();
  });

  it("should create a GMapsCartoDBLayerGroupView when the layer is CartoDBLayerGroupAnonymous", function() {
    layer = new CartoDBLayerGroupAnonymous({}, {});
    var lyr = map.addLayer(layer);
    var layerView = mapView.getLayerByCid(lyr);
    expect(layerView instanceof GMapsCartoDBLayerGroupView).toBeTruthy();
  });

  it("should create a GMapsCartoDBLayerGroupView when the layer is CartoDBLayerGroupNamed", function() {
    layer = new CartoDBLayerGroupNamed({}, {});
    var lyr = map.addLayer(layer);
    var layerView = mapView.getLayerByCid(lyr);
    expect(layerView instanceof GMapsCartoDBLayerGroupView).toBeTruthy();
  });

  it("should create a cartodb logo when layer is CartoDBLayerGroupAnonymous", function(done) {
    layer = new CartoDBLayerGroupAnonymous({}, {});
    var lyr = map.addLayer(layer);
    var layerView = mapView.getLayerByCid(lyr);

    setTimeout(function() {
      expect(container.find("div.cartodb-logo").length).toEqual(1);
      done();
    }, 3000);
  });

  it("should create a cartodb logo when layer is CartoDBLayerGroupNamed", function(done) {
    layer = new CartoDBLayerGroupNamed({}, {});
    var lyr = map.addLayer(layer);
    var layerView = mapView.getLayerByCid(lyr);

    setTimeout(function() {
      expect(container.find("div.cartodb-logo").length).toEqual(1);
      done();
    }, 3000);
  });

  it("should create a PlainLayer when the layer is cartodb", function() {
    layer = new PlainLayer({});
    var lyr = map.addLayer(layer);
    var layerView = mapView.getLayerByCid(lyr);
    expect(layerView.__proto__.constructor).toEqual(GMapsPlainLayerView);
  });

  var geojsonFeature = {
      "type": "Point",
      "coordinates": [-104.99404, 39.75621]
  };


  var multipoly = {"type":"MultiPolygon","coordinates": [
    [
      [[40, 40], [20, 45], [45, 30], [40, 40]]
    ],
    [
      [[20, 35], [45, 20], [30, 5], [10, 10], [10, 30], [20, 35]],
      [[30, 20], [20, 25], [20, 15], [30, 20]]
    ]
  ]
  }

  function testGeom(g) {
    var geo = new Geometry({
      geojson: g
    });
    map.addGeometry(geo);
    expect(_.size(mapView.geometries)).toEqual(1);
    geo.destroy();
    expect(_.size(mapView.geometries)).toEqual(0);
  }

  it("should add and remove a geometry", function() {
    testGeom(geojsonFeature);
  });

  it("should add and remove a polygon", function() {
    testGeom(multipoly);
  });

  it("should edit a geometry", function() {
    var geo = new Geometry({
      geojson: geojsonFeature
    });
    map.addGeometry(geo);
    var v = mapView.geometries[geo.cid];
    v.trigger('dragend', null, [10, 20]);
    expect(geo.get('geojson')).toEqual({
      "type": "Point",
      "coordinates": [20, 10]
    });
  });

  it("should convert to geojson", function() {
    var geo = new Geometry({
      geojson: multipoly
    });
    map.addGeometry(geo);
    var v = mapView.geometries[geo.cid];
    var geojson = GmapsPathView.getGeoJSON(v.geom, 'MultiPolygon');
    expect(geojson).toEqual(multipoly);
  });

  it("should disable gmaps dragging and double click zooming when the map has drag disabled", function() {
    var container = $('<div>').css({
        'height': '200px',
        'width': '200px'
    });
    var map = new Map({
      drag: false
    });
    var mapView = new GoogleMapsMapView({
      el: container,
      map: map
    });

    expect(mapView.map_googlemaps.get('draggable')).toBeFalsy();
    expect(mapView.map_googlemaps.get('disableDoubleClickZoom')).toBeFalsy();
  });
});
