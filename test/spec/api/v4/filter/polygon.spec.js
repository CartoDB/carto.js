var carto = require('../../../../../src/api/v4/index');

describe('api/v4/filter/polygon', function () {
  describe('initialization', function () {
    it('should create the internalModel', function () {
      var polygonFilter = new carto.filter.Polygon();

      expect(polygonFilter.$getInternalModel()).toBeDefined();
    });
  });

  describe('.setPolygon', function () {
    var polygonFilter;

    beforeEach(function () {
      polygonFilter = new carto.filter.Polygon();
    });

    it('checks if polygon is valid', function () {
      var test = function () {
        polygonFilter.setPolygon({
          ups: 'notExpected'
        });
      };

      var test2 = function () {
        polygonFilter.setPolygon({
          type: 'NotAPolygon',
          coordinates: {
            content: 'isNotAnArrayOfCoords'
          }
        });
      };

      const expected = 'Polygon object is not valid. Use a carto.filter.PolygonData object';
      expect(test).toThrowError(Error, expected);
      expect(test2).toThrowError(Error, expected);
    });

    it('if polygon is valid, it assigns it to property, triggers the polygonChanged event and returns this', function () {
      spyOn(polygonFilter, 'trigger');
      var polygon = {
        type: 'Polygon',
        coordinates: [[1, 2], [3, 4], [5, 6], [1, 2]]
      };
      var returnedObject = polygonFilter.setPolygon(polygon);

      expect(polygonFilter.getPolygon()).toEqual(polygon);
      expect(polygonFilter.trigger).toHaveBeenCalledWith('polygonChanged', polygon);
      expect(returnedObject).toBe(polygonFilter);
    });
  });

  describe('.resetPolygon', function () {
    it('sets the polygon as empty', function () {
      var polygonFilter = new carto.filter.Polygon();
      polygonFilter.setPolygon({
        type: 'Polygon',
        coordinates: [[1, 2], [3, 4], [5, 6], [1, 2]]
      });

      expect(polygonFilter.getPolygon()).toEqual({
        type: 'Polygon',
        coordinates: [[1, 2], [3, 4], [5, 6], [1, 2]]
      });

      polygonFilter.resetPolygon();

      expect(polygonFilter.getPolygon()).toEqual({
        type: 'Polygon',
        coordinates: []
      });
    });
  });
});
