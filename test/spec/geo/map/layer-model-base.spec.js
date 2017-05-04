var LayerModelBase = require('../../../../src/geo/map/layer-model-base');

var MyLayer = LayerModelBase.extend({
  EQUALITY_ATTRIBUTES: [ 'attr1', 'attr2' ]
});

describe('geo/map/layer-model-base.js', function () {
  beforeEach(function () {
    this.layer = new MyLayer();
  });

  describe('.remove', function () {
    it('should trigger a destroy event with options', function () {
      var callback = jasmine.createSpy('callback');
      var collection = {};
      var option = { option: 'one' };

      this.layer.bind('destroy', callback);
      this.layer.collection = collection;
      this.layer.remove(option);

      expect(callback).toHaveBeenCalledWith(this.layer, this.layer.collection, option);
    });
  });

  describe('.update', function () {
    it('should set the attributes', function () {
      this.layer.update({
        a: 1,
        b: 2
      });

      expect(this.layer.get('a')).toEqual(1);
      expect(this.layer.get('b')).toEqual(2);
    });
  });

  describe('.show', function () {
    it('should set the visible attribute to true', function () {
      this.layer.set('visible', false);

      this.layer.show();

      expect(this.layer.get('visible')).toBeTruthy();
    });
  });

  describe('.hide', function () {
    it('should set the visible attribute to false', function () {
      this.layer.set('visible', true);

      this.layer.hide();

      expect(this.layer.get('visible')).toBeFalsy();
    });
  });

  describe('.toggle', function () {
    it('should toggel the visible attribute', function () {
      this.layer.set('visible', false);

      this.layer.toggle();

      expect(this.layer.get('visible')).toBeTruthy();

      this.layer.toggle();

      expect(this.layer.get('visible')).toBeFalsy();
    });
  });

  describe('.setOk', function () {
    it('should unset error attribute', function () {
      this.layer.set('error', 'error');
      this.layer.setOk();
      expect(this.layer.get('error')).toBeUndefined();
    });
  });

  describe('.setError', function () {
    it('should set error attribute', function () {
      this.layer.setError('wadus');

      expect(this.layer.get('error')).toEqual('wadus');
    });
  });

  describe('.isEqual', function () {
    it("should return false if type doesn't match", function () {
      var layer1 = new MyLayer({ type: 'type1', attr1: '1', attr2: '2' });
      var layer2 = new MyLayer({ type: 'type2', attr3: '1', attr4: '2' });

      expect(layer1.isEqual(layer2)).toBe(false);
    });

    it("should return false if type matches but some attrs don't match", function () {
      var layer1 = new MyLayer({ type: 'type1', attr1: '1', attr2: '2' });
      var layer2 = new MyLayer({ type: 'type1', attr1: '1', attr2: '3' });

      expect(layer1.isEqual(layer2)).toBe(false);
    });

    it('should return true if type and all attrs match', function () {
      var layer1 = new MyLayer({ type: 'type1', attr1: '1', attr2: '2' });
      var layer2 = new MyLayer({ type: 'type1', attr1: '1', attr2: '2' });

      expect(layer1.isEqual(layer2)).toBe(true);
    });
  });
});
