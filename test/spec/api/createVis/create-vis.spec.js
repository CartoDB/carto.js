var $ = require('jquery');
var createVis = require('../../../../src/api/create-vis');
var scenarios = require('./scenarios');
var Loader = require('../../../../src/core/loader');
var util = require('../../../../src/core/util');

describe('create-vis:', function () {
  beforeEach(function () {
    this.visJson = scenarios.load('basic');
    this.container = $('<div id="map">').css('height', '200px');
    this.containerId = this.container[0].id;
    $('body').append(this.container);
  });

  afterEach(function () {
    this.container.remove();
  });

  it('should throw errors when required parameters are missing', function () {
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

  it('should use the given vis.json (instead downloading) when the visjson parameter is provided', function () {
    spyOn(Loader, 'get');
    createVis(this.containerId, this.visJson);
    expect(Loader.get).not.toHaveBeenCalled();
  });

  it('should download the vizjson file from a URL when the visjson parameter is provided and is a string', function () {
    spyOn(Loader, 'get');
    createVis(this.containerId, 'www.example.com/fake_vis.json');
    expect(Loader.get).toHaveBeenCalledWith('www.example.com/fake_vis.json', jasmine.any(Function));
  });

  describe('Default (no Options)', function () {
    it('should get the title from the visJson', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.get('title')).toEqual(this.visJson.title);
    });

    it('should get the description from the visJson', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.get('description')).toEqual(this.visJson.description);
    });

    it('should initialize the right protocol (https:false)', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.get('https')).toEqual(false);
    });

    it('should not have interactive features by default', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.get('interactiveFeatures')).toEqual(false);
    });

    it('should display the "loader" overlay by default [loaderControl, tiles_loader]', function () {
      // loaderControl and tiles_loader appear to do the same.
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.overlaysCollection.findWhere({ type: 'loader' })).toBeDefined();
    });

    it('should display the "logo" by default', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.overlaysCollection.findWhere({ type: 'logo' })).toBeDefined();
    });

    it('should not display empty infowindow fields by default', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.get('showEmptyInfowindowFields')).toEqual(false);
    });

    it('should have legends', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.settings.get('showLegends')).toEqual(true);
    });

    it('should show layer selector', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.settings.get('showLayerSelector')).toEqual(true);
      expect(visModel.settings.get('layerSelectorEnabled')).toEqual(true);
    });

    it('should have "infowindow" enabled by default', function () {
      pending('It seems that this option is no longer being used');
    });

    it('should have "tooltip" by default', function () {
      pending('It seems that this option  is no longer being used');
    });
  });

  describe('Options', function () {
    describe('skipMapInstantiation', function () {
      it('should instantiate map when skipMapInstantiation option is falsy', function (done) {
        var visModel = createVis(this.containerId, this.visJson);
        setTimeout(function () {
          expect(visModel._instantiateMapWasCalled).toEqual(true);
          done();
        }, 25);
      });

      it('should NOT instantiate map when skipMapInstantiation option is truthy', function (done) {
        var visModel = createVis(this.containerId, this.visJson, { skipMapInstantiation: true });
        setTimeout(function () {
          expect(visModel._instantiateMapWasCalled).toEqual(false);
          done();
        }, 25);
      });
    });
  });

  describe('VisModel.map', function () {
    it('should have the right map center from the visJson', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.map.get('center')).toEqual(this.visJson.center);
    });

    it('should have the right title', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.map.get('title')).toEqual(this.visJson.title);
    });

    it('should have the right description', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.map.get('description')).toEqual(this.visJson.description);
    });

    it('should have the right bounds', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.map.get('view_bounds_sw')).toEqual(this.visJson.bounds[0]);
      expect(visModel.map.get('view_bounds_ne')).toEqual(this.visJson.bounds[1]);
      expect(visModel.map.get('bounds')).toBeUndefined();
    });

    it('should have the right zoom', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.map.get('zoom')).toEqual(this.visJson.zoom);
    });

    it('should have the right scrollwheel', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.map.get('scrollwheel')).toEqual(this.visJson.options.scrollwheel);
    });

    it('should have the right drag', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.map.get('drag')).toEqual(true);
    });

    it('should have the right provider [leaflet]', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.map.get('provider')).toEqual('leaflet');
    });

    it('should have the right provider [googleMaps]', function () {
      this.visJson.map_provider = 'googlemaps';
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.map.get('provider')).toEqual('googlemaps');
    });

    it('should have the right feature interactivity', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.map.get('isFeatureInteractivityEnabled')).toEqual(false);
    });

    it('should have the right render mode', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.map.get('renderMode')).toEqual(this.visJson.vector ? 'vector' : 'raster');
    });

    describe('drag', function () {
      beforeEach(function () {
        spyOn(util, 'isMobileDevice').and.returnValue(false);
      });

      it('should be disabled when there is no overlays and options.scrollwheel is falsy', function () {
        this.visJson.options.scrollwheel = false;
        this.visJson.overlays = [];
        var visModel = createVis(this.containerId, this.visJson, { skipMapInstantiation: true });
        expect(visModel.map.get('drag')).toBe(false);
      });

      it("should be enabled when there's a zoom overlay", function () {
        this.visJson.overlays = [
          {
            type: 'zoom',
            order: 6,
            options: {
              x: 20,
              y: 20,
              display: true
            },
            template: ''
          }
        ];
        var visModel = createVis(this.containerId, this.visJson, { skipMapInstantiation: true });
        expect(visModel.map.get('drag')).toBe(true);
      });

      it('should be enabled when there is no overlays but options.scrollwheel is enabled', function () {
        this.visJson.overlays = [];
        this.visJson.options.scrollwheel = true;
        var visModel = createVis(this.containerId, this.visJson, { skipMapInstantiation: true });
        expect(visModel.map.get('drag')).toBe(true);
      });

      it('should be enabled when using a mobile device', function () {
        util.isMobileDevice.and.returnValue(true);
        var visModel = createVis(this.containerId, this.visJson, { skipMapInstantiation: true });
        expect(visModel.map.get('drag')).toBe(true);
      });
    });

    describe('scrollwheel', function () {
      it('should be true when scrollwheel is true in vizjson and no options are given', function () {
        var visModel = createVis(this.containerId, this.visJson);
        expect(visModel.map.get('scrollwheel')).toEqual(true);
      });

      it('should be false when scrollwheel option is false in vizjson and no options are given', function () {
        this.visJson.options.scrollwheel = false;
        var visModel = createVis(this.containerId, this.visJson, { skipMapInstantiation: true });
        expect(visModel.map.get('scrollwheel')).toEqual(false);
      });

      it('should be true when scrollwheel option is false in the viz.json but given option is set to true', function () {
        this.visJson.options.scrollwheel = false;
        var visModel = createVis(this.containerId, this.visJson, { skipMapInstantiation: true, scrollwheel: true });
        expect(visModel.map.get('scrollwheel')).toEqual(true);
      });

      it('should be false when scrollwheel option is true in the viz.json but given option is set to false', function () {
        var visModel = createVis(this.containerId, this.visJson, { skipMapInstantiation: true, scrollwheel: false });
        expect(visModel.map.get('scrollwheel')).toEqual(false);
      });
    });
  });

  describe('VisModel._windshaftMap', function () {
    it('should have the right statTag', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel._windshaftMap.get('statTag')).toEqual(this.visJson.datasource.stat_tag);
    });

    it('should have the _analysisCollection linked', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel._windshaftMap._analysisCollection).toEqual(visModel._analysisCollection);
    });

    it('should have the analysisCollection linked', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel._windshaftMap._analysisCollection).toEqual(visModel._analysisCollection);
    });

    it('should have the dataviewsCollection linked', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel._windshaftMap._dataviewsCollection).toEqual(visModel._dataviewsCollection);
    });

    it('should have the layersCollection linked', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel._windshaftMap._layersCollection).toEqual(visModel._layersCollection);
    });
    describe('.windshaftSettings', function () {
      it('should have the right urlTemplate', function () {
        var visModel = createVis(this.containerId, this.visJson);
        expect(visModel._windshaftMap._windshaftSettings.urlTemplate).toEqual(this.visJson.datasource.maps_api_template);
      });

      it('should have the right userName', function () {
        var visModel = createVis(this.containerId, this.visJson);
        expect(visModel._windshaftMap._windshaftSettings.userName).toEqual(this.visJson.datasource.user_name);
      });

      it('should have the right statTag', function () {
        var visModel = createVis(this.containerId, this.visJson);
        expect(visModel._windshaftMap._windshaftSettings.statTag).toEqual(this.visJson.datasource.stat_tag);
      });

      it('should not have apikey', function () {
        var visModel = createVis(this.containerId, this.visJson);
        expect(visModel._windshaftMap._windshaftSettings.apikey).toBeUndefined();
      });

      it('should not have authToken', function () {
        var visModel = createVis(this.containerId, this.visJson);
        expect(visModel._windshaftMap._windshaftSettings.authToken).toBeUndefined();
      });
    });
    describe('.client', function () {
      it('should have the right url', function () {
        var visModel = createVis(this.containerId, this.visJson);
        var expectedClientUrl = this.visJson.datasource.maps_api_template.replace(/{user}/, this.visJson.datasource.user_name);
        expect(visModel._windshaftMap.client.url).toEqual(expectedClientUrl);
      });

      it('should have the right get endpoint', function () {
        var visModel = createVis(this.containerId, this.visJson);
        var expectedGetEndPoint = 'api/v1/map/named/' + this.visJson.datasource.template_name + '/jsonp';
        expect(visModel._windshaftMap.client.endpoints.get).toEqual(expectedGetEndPoint);
      });

      it('should have the right post endpoint', function () {
        var visModel = createVis(this.containerId, this.visJson);
        var expectedGetEndPoint = 'api/v1/map/named/' + this.visJson.datasource.template_name;
        expect(visModel._windshaftMap.client.endpoints.post).toEqual(expectedGetEndPoint);
      });
    });
    describe('.modelUpdater', function () {
      it('should have the visModel linked', function () {
        var visModel = createVis(this.containerId, this.visJson);
        expect(visModel._windshaftMap._modelUpdater._visModel).toEqual(visModel);
      });

      it('should have the mapModel linked', function () {
        var visModel = createVis(this.containerId, this.visJson);
        expect(visModel._windshaftMap._modelUpdater._mapModel).toEqual(visModel.map);
      });

      it('should have the layerGroupModel linked', function () {
        var visModel = createVis(this.containerId, this.visJson);
        expect(visModel._windshaftMap._modelUpdater._layerGroupModel).toEqual(visModel.layerGroupModel);
      });

      it('should have the dataviewsCollection linked', function () {
        var visModel = createVis(this.containerId, this.visJson);
        expect(visModel._windshaftMap._modelUpdater._dataviewsCollection).toEqual(visModel._dataviewsCollection);
      });

      it('should have the layersCollection linked', function () {
        var visModel = createVis(this.containerId, this.visJson);
        expect(visModel._windshaftMap._modelUpdater._layersCollection).toEqual(visModel._layersCollection);
      });

      it('should have the analysisCollection linked', function () {
        var visModel = createVis(this.containerId, this.visJson);
        expect(visModel._windshaftMap._modelUpdater._analysisCollection).toEqual(visModel._analysisCollection);
      });
    });
  });

  describe('VisModel.overlays', function () {
    it('should have a share overlay', function () {
      var visModel = createVis(this.containerId, this.visJson);
      // TODO: Review if this overlay is still supported!
      expect(visModel.overlaysCollection.findWhere({ type: 'share' })).toBeDefined();
    });

    it('should have a search overlay', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.overlaysCollection.findWhere({ type: 'search' })).toBeDefined();
    });

    it('should have a zoom overlay', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.overlaysCollection.findWhere({ type: 'zoom' })).toBeDefined();
    });

    it('should have a loader overlay', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.overlaysCollection.findWhere({ type: 'loader' })).toBeDefined();
    });

    it('should have a logo overlay', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.overlaysCollection.findWhere({ type: 'logo' })).toBeDefined();
    });

    it('should have a attribution overlay', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel.overlaysCollection.findWhere({ type: 'attribution' })).toBeDefined();
    });
  });

  describe('VisModel._dataviewsCollection', function () {
    it('should not have dataviews', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel._dataviewsCollection.length).toEqual(0);
    });
  });

  describe('VisModel._analysisCollection', function () {
    it('should have one analysis', function () {
      var visModel = createVis(this.containerId, this.visJson);
      expect(visModel._analysisCollection.findWhere({ type: 'source' })).toBeDefined();
    });
  });
});
