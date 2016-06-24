var _ = require('underscore');
var $ = require('jquery');
var Loader = require('../../../src/core/loader');
var createVis = require('../../../src/api/create-vis');
var fakeVizJSON = require('./fake-vizjson');

describe('src/api/create-vis', function () {
  beforeEach(function () {
    this.container = $('<div id="map">').css('height', '200px');
    this.containerId = this.container[0].id;
    $('body').append(this.container);
  });

  afterEach(function () {
    this.container.remove();
  });

  it('should throw errors', function () {
    expect(function () {
      createVis();
    }).toThrowError('a valid DOM element or selector must be provided');

    expect(function () {
      createVis('something');
    }).toThrowError('a valid DOM element or selector must be provided');

    expect(function () {
      createVis(this.containerId);
    }.bind(this)).toThrowError('a vizjson URL or object must be provided');

    expect(function () {
      createVis(this.container[0], 'vizjson');
    }.bind(this)).not.toThrowError();

    expect(function () {
      createVis(this.containerId, 'vizjson');
    }.bind(this)).not.toThrowError();
  });

  it('should load the vizjson file from a URL', function (done) {
    spyOn(Loader, 'get');
    var vis = createVis(this.containerId, 'http://example.com/vizjson');

    // Simulate a successful response from Loader.get
    var loaderCallback = Loader.get.calls.mostRecent().args[1];
    loaderCallback(fakeVizJSON);

    vis.done(function (vis, layers) {
      expect(vis).toBeDefined();
      expect(layers).toBeDefined();
      done();
    });
  });

  it('should use the given vizjson object', function () {
    spyOn(Loader, 'get');
    var vis = createVis(this.containerId, fakeVizJSON);
    expect(Loader.get).not.toHaveBeenCalled();
    vis.done(function (vis, layers) {
      expect(vis).toBeDefined();
      expect(layers).toBeDefined();
    });
  });

  it('should set the given center if values are correct', function () {
    var opts = {
      center_lat: 43.3,
      center_lon: '89'
    };

    var vis = createVis(this.containerId, fakeVizJSON, opts);

    expect(vis.map.get('center')).toEqual([43.3, 89.0]);
  });

  it('should not set the center if values are not correct', function () {
    var opts = {
      center_lat: 43.3,
      center_lon: 'ham'
    };

    var vis = createVis(this.containerId, fakeVizJSON, opts);

    expect(vis.map.get('center')).toEqual([ 41.40578459184651, 2.2230148315429688 ]);
  });

  it('should parse bounds values if they are correct', function () {
    var opts = {
      sw_lat: 43.3,
      sw_lon: 12,
      ne_lat: 12,
      ne_lon: '0'
    };

    var vis = createVis(this.containerId, fakeVizJSON, opts);

    expect(vis.map.get('view_bounds_sw')).toEqual([43.3, 12]);
    expect(vis.map.get('view_bounds_ne')).toEqual([12, 0]);
  });

  it('should not parse bounds values if they are not correct', function () {
    var opts = {
      sw_lat: 43.3,
      sw_lon: 12,
      ne_lat: 'jamon',
      ne_lon: '0'
    };

    var vis = createVis(this.containerId, fakeVizJSON, opts);

    expect(vis.map.get('view_bounds_sw')).toEqual([
      41.340989240001214,
      2.0194244384765625
    ]);
    expect(vis.map.get('view_bounds_ne')).toEqual([
      41.47051539294297,
      2.426605224609375
    ]);
  });

  it('should add header', function (done) {
    fakeVizJSON.title = 'title';

    var opts = {
      title: true
    };

    createVis(this.containerId, fakeVizJSON, opts);

    _.defer(function () {
      expect(this.container.find('.cartodb-header').length).toEqual(1);
      done();
    }.bind(this));
  });

  it('should add layer selector', function (done) {
    var opts = {
      title: true,
      layer_selector: true
    };

    createVis(this.containerId, fakeVizJSON, opts);

    _.defer(function () {
      expect(this.container.find('.cartodb-layer-selector-box').length).toEqual(1);
      done();
    }.bind(this));
  });

  it('should add header without link in the title', function () {
    fakeVizJSON.title = 'title';
    fakeVizJSON.url = null;

    var opts = {
      title: true
    };

    createVis(this.containerId, fakeVizJSON, opts);

    _.defer(function () {
      expect(this.container.find('.cartodb-header').length).toEqual(1);
      expect(this.container.find('.cartodb-header h1 > a').length).toEqual(0);
    }.bind(this));
  });

  it('should add zoom', function (done) {
    fakeVizJSON.overlays = [{ type: 'zoom', order: 7, options: { x: 20, y: 20 }, template: 'test' }];

    createVis(this.containerId, fakeVizJSON, {});

    _.defer(function () {
      expect(this.container.find('.CDB-Zoom').length).toEqual(1);
      done();
    }.bind(this));
  });

  it("should enable zoom if it's specified by zoomControl option", function (done) {
    fakeVizJSON.overlays = [{ type: 'zoom', order: 7, options: { x: 20, y: 20 }, template: 'test' }];
    var opts = {
      zoomControl: true
    };

    createVis(this.containerId, fakeVizJSON, opts);

    _.defer(function () {
      expect(this.container.find('.CDB-Zoom').length).toEqual(1);
      done();
    }.bind(this));
  });

  it("should disable zoom if it's specified by zoomControl option", function (done) {
    fakeVizJSON.overlays = [{ type: 'zoom', order: 7, options: { x: 20, y: 20 }, template: 'test' }];
    var opts = {
      zoomControl: false
    };

    createVis(this.containerId, fakeVizJSON, opts);

    _.defer(function () {
      expect(this.container.find('.CDB-Zoom').length).toEqual(0);
      done();
    }.bind(this));
  });

  it('should add search', function (done) {
    fakeVizJSON.overlays = [{ type: 'search' }];

    createVis(this.containerId, fakeVizJSON, {});

    _.defer(function () {
      expect(this.container.find('.CDB-Search').length).toEqual(1);
      done();
    }.bind(this));
  });

  it("should enable search if it's specified by searchControl", function (done) {
    fakeVizJSON.overlays = [{ type: 'search' }];

    var opts = {
      searchControl: true
    };

    createVis(this.containerId, fakeVizJSON, opts);

    _.defer(function () {
      expect(this.container.find('.CDB-Search').length).toEqual(1);
      done();
    }.bind(this));
  });

  it("should disable search if it's specified by searchControl", function (done) {
    fakeVizJSON.overlays = [{ type: 'search' }];

    var opts = {
      searchControl: false
    };

    createVis(this.containerId, fakeVizJSON, opts);

    _.defer(function () {
      expect(this.container.find('.CDB-Search').length).toEqual(0);
      done();
    }.bind(this));
  });

  var mapInstantiationRequestDone = function () {
    return _.any($.ajax.calls.allArgs(), function (args) {
      var expectedURLRegexp = /(http|https):\/\/cdb.localhost.lan:8181\/api\/v1\/map\/named\/tpl_6a31d394_7c8e_11e5_8e42_080027880ca6\?stat_tag=6a31d394-7c8e-11e5-8e42-080027880ca6/;
      return args[0].url.match(expectedURLRegexp);
    });
  };

  describe('map instantiation', function () {
    beforeEach(function () {
      spyOn($, 'ajax');
    });

    it('should instantiate map', function (done) {
      this.vis = createVis(this.containerId, fakeVizJSON, {});

      setTimeout(function () {
        expect(mapInstantiationRequestDone()).toEqual(true);
        done();
      }, 25);
    });

    it('should NOT instantiate map if skipMapInstantiation options is set to true', function (done) {
      this.vis = createVis(this.containerId, fakeVizJSON, {
        skipMapInstantiation: true
      });

      setTimeout(function () {
        expect(mapInstantiationRequestDone()).toEqual(false);
        done();
      }, 25);
    });
  });
});
