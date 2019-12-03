var carto = require('../../../../../src/api/v4/index');

fdescribe('api/v4/filter/circle', function () {
  describe('initialization', function () {
    it('should create the internalModel', function () {
      var circleFilter = new carto.filter.Circle();

      expect(circleFilter.$getInternalModel()).toBeDefined();
    });
  });

  describe('.setCircle', function () {
    var circleFilter;

    beforeEach(function () {
      circleFilter = new carto.filter.Circle();
    });

    it('checks if circle is valid', function () {
      var test = function () {
        circleFilter.setCircle({ lng: 0 });
      };

      var test2 = function () {
        circleFilter.setCircle({ lng: 'a' });
      };

      const expected = 'Circle object is not valid. Use a carto.filter.CircleData object';
      expect(test).toThrowError(Error, expected);
      expect(test2).toThrowError(Error, expected);
    });

    it('if circle is valid, it assigns it to property, triggers the circleChanged event and returns this', function () {
      spyOn(circleFilter, 'trigger');
      var circle = { lat: 1, lng: 2, radius: 3 };
      var returnedObject = circleFilter.setCircle(circle);

      expect(circleFilter.getCircle()).toEqual(circle);
      expect(circleFilter.trigger).toHaveBeenCalledWith('circleChanged', circle);
      expect(returnedObject).toBe(circleFilter);
    });
  });

  describe('.resetCircle', function () {
    it('sets the circle to 0,0,0', function () {
      var circleFilter = new carto.filter.Circle();
      circleFilter.setCircle({ lat: 1, lng: 2, radius: 3 });

      expect(circleFilter.getCircle()).toEqual({ lat: 1, lng: 2, radius: 3 });

      circleFilter.resetCircle();

      expect(circleFilter.getCircle()).toEqual({ lat: 0, lng: 0, radius: 0 });
    });
  });
});
