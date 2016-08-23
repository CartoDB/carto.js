/* global L */
var $ = require('jquery');
var Backbone = require('backbone');
var Map = require('../../../../src/geo/map');
var LeafletMapView = require('../../../../src/geo/leaflet/leaflet-map-view');
var LeafletLayerViewFactory = require('../../../../src/geo/leaflet/leaflet-layer-view-factory');
var TorqueLayer = require('../../../../src/geo/map/torque-layer');
var SharedTestsForTorqueLayer = require('../shared-tests-for-torque-layer');

describe('geo/leaflet/leaflet-torque-layer-view', function () {
  beforeEach(function () {
    var container = $('<div>').css({
      'height': '200px',
      'width': '200px'
    });
    this.vis = jasmine.createSpyObj('vis', ['reload']);
    this.map = new Map();
    this.mapView = new LeafletMapView({
      el: container,
      map: this.map,
      layerViewFactory: new LeafletLayerViewFactory(),
      layerGroupModel: new Backbone.Model()
    });

    spyOn(L.TorqueLayer.prototype, 'initialize').and.callThrough();

    this.model = new TorqueLayer({
      type: 'torque',
      sql: 'select * from table',
      cartocss: 'Map {} #test {}',
      dynamic_cdn: 'dynamic-cdn-value'
    }, { vis: this.vis });
    this.map.addLayer(this.model);
    this.view = this.mapView._layerViews[this.model.cid];
  });

  SharedTestsForTorqueLayer.call(this);

  it('should reuse layer view', function () {
    expect(this.view instanceof L.TorqueLayer).toEqual(true);

    this.view.check = 'testing';
    var newLayer = new TorqueLayer(this.view.model.attributes, {
      vis: this.vis
    });
    newLayer.set({ sql: 'select * from table', cartocss: '#test {}' });
    this.map.layers.reset([newLayer]);

    expect(this.mapView._layerViews[newLayer.cid] instanceof L.TorqueLayer).toEqual(true);
    expect(this.mapView._layerViews[newLayer.cid].model).toEqual(newLayer);
    expect(this.mapView._layerViews[newLayer.cid].check).toEqual('testing');
  });

  it('should apply Leaflet TorqueLayer initialize method on the extended view with a bunch of attrs', function () {
    expect(L.TorqueLayer.prototype.initialize).toHaveBeenCalled();

    var attrs = L.TorqueLayer.prototype.initialize.calls.argsFor(0)[0];
    expect(attrs.cartocss).toEqual(jasmine.any(String));
    expect(attrs.dynamic_cdn).toEqual('dynamic-cdn-value');
    expect(attrs.instanciateCallback).toEqual(jasmine.any(Function));
  });

  it("should update providers's templateURL when urls change", function () {
    this.model.set('tileURLTemplates', [
      'http://pepe.carto.com/{z}/{x}/{y}.torque',
      'http://juan.carto.com/{z}/{x}/{y}.torque'
    ]);

    expect(this.view.provider.templateUrl).toEqual('http://pepe.carto.com/{z}/{x}/{y}.torque');
  });
});
