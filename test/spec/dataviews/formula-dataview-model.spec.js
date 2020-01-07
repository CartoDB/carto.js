var Backbone = require('backbone');
var FormulaDataviewModel = require('../../../src/dataviews/formula-dataview-model.js');
var MockFactory = require('../../helpers/mockFactory');
var WindshaftFiltersBoundingBox = require('../../../src/windshaft/filters/bounding-box');
var WindshaftFiltersCircle = require('../../../src/windshaft/filters/circle');
var WindshaftFiltersPolygon = require('../../../src/windshaft/filters/polygon');
var MapModelBoundingBoxAdapter = require('../../../src/geo/adapters/map-model-bounding-box-adapter');
var createEngine = require('../fixtures/engine.fixture.js');

describe('dataviews/formula-dataview-model', function () {
  var engineMock;
  var apiKey = 'API_KEY';
  var apiKeyQueryParam = 'api_key=' + apiKey;

  beforeEach(function () {
    this.map = new Backbone.Model();
    this.map.getViewBounds = jasmine.createSpy();
    engineMock = createEngine({ apiKey: apiKey });
    this.map.getViewBounds.and.returnValue([[1, 2], [3, 4]]);

    this.layer = new Backbone.Model();

    this.source = MockFactory.createAnalysisModel({ id: 'a0' });

    this.model = new FormulaDataviewModel({
      source: this.source,
      operation: 'min'
    }, {
      map: this.map,
      engine: engineMock,
      layer: this.layer,
      bboxFilter: new WindshaftFiltersBoundingBox(new MapModelBoundingBoxAdapter(this.map))
    });
  });

  it('should reload map and force fetch on operation change', function () {
    engineMock.reload.calls.reset();
    this.model.set('operation', 'avg');
    expect(engineMock.reload).toHaveBeenCalledWith({ forceFetch: true, sourceId: 'a0' });
  });

  it('should reload map and force fetch on column change', function () {
    engineMock.reload.calls.reset();
    this.model.set('column', 'other_col');
    expect(engineMock.reload).toHaveBeenCalledWith({ forceFetch: true, sourceId: 'a0' });
  });

  describe('.url', function () {
    it('should include the bbox parameter', function () {
      expect(this.model.set('url', 'http://example.com'));
      expect(this.model.url()).toEqual('http://example.com?bbox=2,1,4,3&' + apiKeyQueryParam);
    });

    it('should include circle filter', function () {
      var filter = new WindshaftFiltersCircle();
      var circle = {lat: 1, lng: 2, radius: 3};
      filter.setCircle(circle);

      this.model = new FormulaDataviewModel({
        source: this.source
      }, {
        engine: engineMock,
        circleFilter: filter
      });
      // DataviewModel defaults set this prop to true, even for cases like this not requiring passing a bbox filter
      this.model.set('sync_on_bbox_change', false);

      var circleEncoded = encodeURIComponent(JSON.stringify(circle));
      expect(this.model.set('url', 'http://example.com'));
      expect(this.model.url()).toEqual('http://example.com?circle=' + circleEncoded + '&' + apiKeyQueryParam);
    });

    it('should update circle filter', function () {
      var filter = new WindshaftFiltersCircle();
      var circle = {lat: 1, lng: 2, radius: 3};
      filter.setCircle(circle);

      this.model = new FormulaDataviewModel({
        source: this.source
      }, {
        engine: engineMock,
        circleFilter: filter
      });
      // DataviewModel defaults set this prop to true, even for cases like this not requiring passing a bbox filter
      this.model.set('sync_on_bbox_change', false);

      // updated!
      var updatedCircle = {lat: 10, lng: 20, radius: 30};
      filter.setCircle(updatedCircle);

      var updatedCircleEncoded = encodeURIComponent(JSON.stringify(updatedCircle));
      expect(this.model.set('url', 'http://example.com'));
      expect(this.model.url()).toEqual('http://example.com?circle=' + updatedCircleEncoded + '&' + apiKeyQueryParam);
    });

    it('should include polygon filter, plus other required params', function () {
      var filter = new WindshaftFiltersPolygon();
      var polygon = { type: 'Polygon', coordinates: [[1, 2], [3, 4], [5, 6], [1, 2]] };
      filter.setPolygon(polygon);

      this.model = new FormulaDataviewModel({
        source: this.source
      }, {
        engine: engineMock,
        polygonFilter: filter
      });

      // DataviewModel defaults set this prop to true, even for cases like this not requiring passing a bbox filter
      this.model.set('sync_on_bbox_change', false);

      var polygonEncoded = encodeURIComponent(JSON.stringify(polygon));
      expect(this.model.set('url', 'http://example.com'));
      expect(this.model.url()).toEqual('http://example.com?polygon=' + polygonEncoded + '&' + apiKeyQueryParam);
    });

    it('should update polygon filter', function () {
      var filter = new WindshaftFiltersPolygon();
      var polygon = { type: 'Polygon', coordinates: [[1, 2], [3, 4], [5, 6], [1, 2]] };
      filter.setPolygon(polygon);

      this.model = new FormulaDataviewModel({
        source: this.source
      }, {
        engine: engineMock,
        polygonFilter: filter
      });
      // DataviewModel defaults set this prop to true, even for cases like this not requiring passing a bbox filter
      this.model.set('sync_on_bbox_change', false);

      // updated!
      var updatedPolygon = { type: 'Polygon', coordinates: [[10, 20], [30, 40], [50, 60], [10, 20]] };

      filter.setPolygon(updatedPolygon);

      var updatedPolygonEncoded = encodeURIComponent(JSON.stringify(updatedPolygon));
      expect(this.model.set('url', 'http://example.com'));
      expect(this.model.url()).toEqual('http://example.com?polygon=' + updatedPolygonEncoded + '&' + apiKeyQueryParam);
    });
  });
});
