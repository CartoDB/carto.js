var DataviewBase = require('../../../../../src/api/v4/dataview/base');
var status = require('../../../../../src/api/v4/constants').status;
var carto = require('../../../../../src/api/v4/index');
var CartoError = require('../../../../../src/api/v4/error');

function createSourceMock () {
  return new carto.source.Dataset('foo');
}

function createEngineMock () {
  var engine = {
    name: 'Engine mock',
    reload: function () {}
  };
  spyOn(engine, 'reload');

  return engine;
}

xdescribe('api/v4/dataview/base', function () {
  var base = new DataviewBase();

  it('.getStatus should return the internal status', function () {
    expect(base.getStatus()).toEqual(base._status);
  });

  describe('.isLoading', function () {
    it('should return true if loading and false otherwise', function () {
      base._status = status.NOT_LOADED;
      expect(base.isLoading()).toBe(false);
      base._status = status.LOADING;
      expect(base.isLoading()).toBe(true);
    });

    it('should return true if loading and false otherwise', function () {
      base._status = status.NOT_LOADED;
      expect(base.isLoaded()).toBe(false);
      base._status = status.LOADED;
      expect(base.isLoaded()).toBe(true);
    });
  });

  describe('.hasError', function () {
    it('should return true if loading and false otherwise', function () {
      base._status = status.NOT_LOADED;
      expect(base.hasError()).toBe(false);
      base._status = status.ERROR;
      expect(base.hasError()).toBe(true);
    });
  });

  describe('.enable', function () {
    it('should enable the dataview', function () {
      base.enable();
      expect(base._enabled).toBe(true);
    });

    it('should return the dataview', function () {
      expect(base.enable()).toBe(base);
    });
  });

  describe('.disable', function () {
    it('should disable the dataview', function () {
      base.disable();
      expect(base._enabled).toBe(false);
    });

    it('should return the dataview', function () {
      expect(base.disable()).toBe(base);
    });
  });

  describe('.isEnabled', function () {
    it('should return true if enabled and false otherwise', function () {
      base.disable();
      expect(base.isEnabled()).toBe(false);
      base.enable();
      expect(base.isEnabled()).toBe(true);
    });
  });

  describe('.getSource', function () {
    it('should return the source object', function () {
      var source = new carto.source.Dataset('table_name');
      base._source = source;
      expect(base.getSource()).toBe(source);
    });
  });

  describe('.setColumn', function () {
    it('should set the column name as string', function () {
      var column = 'column-test';
      base.setColumn(column);
      expect(base._column).toBe(column);
    });

    it('should throw an error if the argument is not string or undefined', function () {
      expect(function () { base.setColumn(); }).toThrowError(TypeError, 'Column property is required.');
      expect(function () { base.setColumn(12); }).toThrowError(TypeError, 'Column property must be a string.');
      expect(function () { base.setColumn(''); }).toThrowError(TypeError, 'Column property must be not empty.');
    });

    it('should return the dataview', function () {
      var column = 'column-test';
      expect(base.setColumn(column)).toBe(base);
    });
  });

  describe('.getColumn', function () {
    it('should return the column name', function () {
      var column = 'column-test2';
      base._column = column;
      expect(base.getColumn()).toBe(column);
    });
  });

  describe('.getData', function () {
    it('.getData should not be defined in the base dataview', function () {
      expect(function () { base.getData(); }).toThrowError(Error, 'getData must be implemented by the particular dataview.');
    });
  });

  describe('._changeProperty', function () {
    it('should set internal property', function () {
      base._example = 'something';

      base._changeProperty('example', 'whatever');

      expect(base._example).toEqual('whatever');
    });

    it('should trigger change is there is no internal model', function () {
      var eventValue = '';
      base._example = 'something';
      base.on('exampleChanged', function (newValue) {
        eventValue = newValue;
      });

      base._changeProperty('example', 'whatever');

      expect(eventValue).toEqual('whatever');
    });

    it('should value in internal model if exists', function () {
      var usedKey = '';
      var usedValue = '';
      var internalModel = {
        set: function (key, value) {
          usedKey = key;
          usedValue = value;
        }
      };
      base._example = 'something';
      base._internalModel = internalModel;
      spyOn(base, '_triggerChange');

      base._changeProperty('example', 'whatever');

      expect([usedKey, usedValue]).toEqual(['example', 'whatever']);
      expect(base._triggerChange).not.toHaveBeenCalled();
    });
  });

  describe('.$setEngine', function () {
    var engine;
    var dataview;

    beforeEach(function () {
      // We use Formula for these tests. Any other dataview could be used instead.
      dataview = new carto.dataview.Formula(createSourceMock(), 'population', {
        operation: carto.operation.MIN
      });
      engine = createEngineMock();
    });

    it('internalModel events should be properly hooked up', function () {
      dataview.$setEngine(engine);
      var internalModel = dataview._internalModel;
      var eventStatus = null;
      var eventError = null;
      var dataviewError = null;
      dataview.on('statusChanged', function (newStatus, error) {
        eventStatus = newStatus;
        eventError = error;
      });
      dataview.on('error', function (error) {
        dataviewError = error;
      });

      // Loading
      internalModel.trigger('loading');

      expect(dataview.getStatus()).toEqual('loading');
      expect(eventStatus).toEqual('loading');

      // Loaded
      internalModel.trigger('loaded');

      expect(dataview.getStatus()).toEqual('loaded');
      expect(eventStatus).toEqual('loaded');

      // Error
      internalModel.trigger('statusError', internalModel, 'an error');

      expect(dataview.getStatus()).toEqual('error');
      expect(eventStatus).toEqual('error');
      expect(eventError).toEqual('an error');
      expect(dataviewError instanceof CartoError).toBe(true);
    });
  });
});
