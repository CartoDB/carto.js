var _ = require('underscore');
var WindshaftFiltersCategory = require('cdb/windshaft/filters/category');
var Backbone = require('backbone');

describe('windshaft/filters/category', function() {
  var data;

  beforeEach(function() {
    this.filter = new WindshaftFiltersCategory({
      widgetId: 'category_widget'
    });

    data = [];
    for (var i = 0; i < 12; i++) {
      data.push(i);
    }

    this.filter.setDataOrigin(new Backbone.Collection(data));
  });

  it('should generate two internal collections for adding rejected and accepted items', function() {
    expect(this.filter.rejectedCategories).toBeDefined();
    expect(this.filter.acceptedCategories).toBeDefined();
  });

  describe('isEmpty', function() {
    it('should be empty when there is no rejected and accepted items', function() {
      expect(this.filter.isEmpty()).toBeTruthy();
    });
    it('should not be empty when there is rejected items', function() {
      this.filter.reject(1);
      expect(this.filter.isEmpty()).toBeFalsy();
    });
    it('should not be empty when there is accepted items', function() {
      this.filter.accept(1);
      expect(this.filter.isEmpty()).toBeFalsy();
    });
  });

  describe('accept', function() {

    it('should accept an array or a string as an argument', function() {
      var acceptedCats = this.filter.getAccepted();
      this.filter.accept(1);
      expect(acceptedCats.size()).toBe(1);
      this.filter.accept(2);
      expect(acceptedCats.size()).toBe(2);
    });

    it('should trigger change event when value is accepted', function() {
      var callback = jasmine.createSpy('callback');
      this.filter.bind('change', callback, this.filter);
      this.filter.accept(1);
      expect(callback).toHaveBeenCalled();
    });

    it('should remove value from rejected if it is present when it is accepted', function() {
      this.filter.reject(1);
      var rejectedCats = this.filter.getRejected();
      var acceptedCats = this.filter.getAccepted();
      expect(rejectedCats.size()).toBe(1);
      this.filter.accept(1);
      expect(rejectedCats.size()).toBe(0);
      expect(acceptedCats.size()).toBe(1);
    });

    it('should not accept a value if it is already present', function() {
      this.filter.accept(1);
      var acceptedCats = this.filter.getAccepted();
      expect(acceptedCats.size()).toBe(1);
      this.filter.accept(1);
      expect(acceptedCats.size()).toBe(1);
    });
  });

  it('should accept all cleaning accepted and rejected', function() {
    this.filter.accept([1,2,3]);
    this.filter.reject([4,5,6]);
    this.filter.acceptAll();
    expect(this.filter.getRejected().size()).toBe(0);
    expect(this.filter.getAccepted().size()).toBe(0);
  });

  describe('reject', function() {

    it('should reject an array or a string as an argument', function() {
      var rejectedCats = this.filter.getRejected();
      this.filter.reject([1]);
      expect(rejectedCats.size()).toBe(1);
      this.filter.reject(2);
      expect(rejectedCats.size()).toBe(2);
    });

    it('should trigger change event when value is accepted', function() {
      var callback = jasmine.createSpy('callback');
      this.filter.bind('change', callback, this.filter);
      this.filter.accept(1);
      expect(callback).toHaveBeenCalled();
    });

    it('should remove value from accepted if it is present when it is rejected', function() {
      this.filter.accept([1,2]);
      var acceptedCats = this.filter.getAccepted();
      var rejectedCats = this.filter.getRejected();
      expect(acceptedCats.size()).toBe(2);
      this.filter.reject(1);
      expect(rejectedCats.size()).toBe(0);
      expect(acceptedCats.size()).toBe(1);
      this.filter.reject(2);
      expect(rejectedCats.size()).toBe(0);
      expect(acceptedCats.size()).toBe(0);
      this.filter.reject(3);
      expect(rejectedCats.size()).toBe(1);
      expect(acceptedCats.size()).toBe(0);
    });

    it('should not reject a value if it is already present', function() {
      this.filter.reject(1);
      var rejectedCats = this.filter.getRejected();
      expect(rejectedCats.size()).toBe(1);
      this.filter.reject(1);
      expect(rejectedCats.size()).toBe(1);
    });
  });

  it('should reject all cleaning accepted and adding necessary rejects', function() {
    var callback = jasmine.createSpy('callback');
    this.filter.bind('change', callback, this.filter);
    this.filter.accept([1,2,3]);
    this.filter.reject([4]);
    this.filter.rejectAll(data); // data is on the beginning of the doc ;)
    expect(this.filter.getRejected().size()).toBe(12);
    expect(this.filter.getAccepted().size()).toBe(0);
    expect(callback).toHaveBeenCalled();
  });

  describe('isRejected', function() {
    it('should be rejected it is included in reject collection', function() {
      this.filter.reject(1);
      expect(this.filter.isRejected(1)).toBeTruthy();
    });

    it('should be rejected it is not included in any of both (accept or reject) and there are accepted', function() {
      this.filter.accept(4);
      expect(this.filter.isRejected(1)).toBeTruthy();
      this.filter.reject(2);
      expect(this.filter.isRejected(1)).toBeTruthy();
    });

    it('should not be rejected if both collections are empty', function() {
      expect(this.filter.isRejected(1)).toBeFalsy();
    });

    it('should not be rejected if it is present in accepted collection', function() {
      this.filter.accept(1);
      expect(this.filter.isRejected(1)).toBeFalsy();
    });
  });

  describe('toJSON', function() {
    it('should generate an object with attributes when it is serialized', function() {
      this.filter.reject([1,2]);
      var result = this.filter.toJSON();
      expect(result['category_widget']).toBeDefined();
      expect(result['category_widget']['reject']).toBeDefined();
    });

    it('should not generate any value when accept and reject are empty', function() {
      var result = this.filter.toJSON();
      expect(result['category_widget']).toBeDefined();
      expect(result['category_widget']['reject']).not.toBeDefined();
      expect(result['category_widget']['accept']).not.toBeDefined();
    });

    it('should send accept when reject is empty but accept', function() {
      this.filter.accept(3);
      var result = this.filter.toJSON();
      expect(result['category_widget']).toBeDefined();
      expect(result['category_widget']['reject']).not.toBeDefined();
      expect(result['category_widget']['accept']).toBeDefined();
      var accept = result['category_widget']['accept'];
      expect(accept.length).toBe(1);
      expect(accept[0]).toBe('3');
    });

    it('should send reject when accept is empty but reject', function() {
      this.filter.reject([1,2]);
      var result = this.filter.toJSON();
      expect(result['category_widget']).toBeDefined();
      expect(result['category_widget']['reject']).toBeDefined();
      expect(result['category_widget']['accept']).not.toBeDefined();
      var reject = result['category_widget']['reject'];
      expect(reject.length).toBe(2);
      expect(reject[0]).toBe('1');
      expect(reject[1]).toBe('2');
    });

    it('should send accept when both (accept and reject) are not empty, but not completed with both', function() {
      this.filter.reject([1,2]);
      this.filter.accept([3]);
      var result = this.filter.toJSON();
      expect(result['category_widget']).toBeDefined();
      expect(result['category_widget']['reject']).not.toBeDefined();
      expect(result['category_widget']['accept']).toBeDefined();
      var accept = result['category_widget']['accept'];
      expect(accept.length).toBe(1);
      expect(accept[0]).toBe('3');
    });

    // TODO: change this spec when it is fixed in the API
    it('should send a special character in accept when all categories are rejected', function() {
      this.filter.rejectAll(data);
      var result = this.filter.toJSON();
      expect(result['category_widget']).toBeDefined();
      expect(result['category_widget']['reject']).not.toBeDefined();
      expect(result['category_widget']['accept']).toBeDefined();
      var accept = result['category_widget']['accept'];
      expect(accept.length).toBe(1);
      expect(accept[0]).toBe('___@___');
    });

    it('should not send anything when all categories are accepted', function() {
      this.filter.accept(data);
      var result = this.filter.toJSON();
      expect(result['category_widget']).toBeDefined();
      expect(result['category_widget']['reject']).not.toBeDefined();
      expect(result['category_widget']['accept']).not.toBeDefined();
    });

  });

});
