var _ = require('underscore');
var Backbone = require('backbone');
var Map = require('../geo/map');
var DataviewsFactory = require('../dataviews/dataviews-factory');
var DataviewsCollection = require('../dataviews/dataviews-collection');
var WindshaftClient = require('../windshaft/client');
var WindshaftNamedMap = require('../windshaft/named-map');
var WindshaftAnonymousMap = require('../windshaft/anonymous-map');
var AnalysisFactory = require('../analysis/analysis-factory');
var CartoDBLayerGroup = require('../geo/cartodb-layer-group');
var ModelUpdater = require('../windshaft-integration/model-updater');
var LayersCollection = require('../geo/map/layers');
var AnalysisPoller = require('../analysis/analysis-poller');
var LayersFactory = require('./layers-factory');
var SettingsModel = require('./settings');
var whenAllDataviewsFetched = require('./dataviews-tracker');

var STATE_INIT = 'init'; // vis hasn't been sent to Windshaft
var STATE_OK = 'ok'; // vis has been sent to Windshaft and everything is ok
var STATE_ERROR = 'error'; // vis has been sent to Windshaft and there were some issues

var VisModel = Backbone.Model.extend({
  defaults: {
    loading: false,
    showEmptyInfowindowFields: false,
    state: STATE_INIT
  },

  initialize: function (attrs, deps) {
    deps = deps || {};

    this._loadingObjects = [];
    this._analysisPoller = new AnalysisPoller();
    this._layersCollection = new LayersCollection();
    this._analysisCollection = new Backbone.Collection();
    this._dataviewsCollection = new DataviewsCollection();

    this.overlaysCollection = new Backbone.Collection();
    this.settings = new SettingsModel();

    this.layerGroupModel = new CartoDBLayerGroup({
      apiKey: this.get('apiKey'),
      authToken: this.get('authToken')
    }, {
        layersCollection: this._layersCollection
      });

    this._layersFactory = new LayersFactory({
      visModel: this
    });

    this.map = new Map({
      isFeatureInteractivityEnabled: this.get('interactiveFeatures')
    }, {
        layersCollection: this._layersCollection,
        layersFactory: this._layersFactory
      });
    this.listenTo(this.map, 'cartodbLayerMoved', this.reload);

    // Create the public Dataview Factory
    this.dataviews = new DataviewsFactory({
      apiKey: this.get('apiKey'),
      authToken: this.get('authToken')
    }, {
        map: this.map,
        vis: this,
        dataviewsCollection: this._dataviewsCollection,
        analysisCollection: this._analysisCollection
      });

    // Create the public Analysis Factory
    this.analysis = new AnalysisFactory({
      apiKey: this.get('apiKey'),
      authToken: this.get('authToken'),
      analysisCollection: this._analysisCollection,
      vis: this
    });

    if (deps.windshaftSettings) {
      this.setWindshaftSettings(deps.windshaftSettings);
    }
    this._instantiateMapWasCalled = false;
  },

  setWindshaftSettings: function (windshaftSettings) {
    this._windshaftSettings = windshaftSettings;
    this._layersFactory.setWindshaftSettings(windshaftSettings);
  },

  getStaticImageURL: function (options) {
    options = _.defaults({}, options, {
      zoom: 4,
      lat: 0,
      lng: 0,
      width: 300,
      height: 300,
      format: 'png'
    });

    var url;
    var urlTemplate = this.layerGroupModel.getStaticImageURLTemplate();
    if (urlTemplate) {
      url = urlTemplate
        .replace('{z}', options.zoom)
        .replace('{lat}', options.lat)
        .replace('{lng}', options.lng)
        .replace('{width}', options.width)
        .replace('{height}', options.height)
        .replace('{format}', options.format);
    }
    return url;
  },

  done: function (callback) {
    this._doneCallback = callback;
    return this;
  },

  setOk: function () {
    // Invoke this._doneCallback if present, the first time
    // the vis is instantiated correctly
    if (this.get('state') === STATE_INIT) {
      this._doneCallback && this._doneCallback(this);
    }

    this.set('state', STATE_OK);
    this.unset('error');
  },

  error: function (callback) {
    this._errorCallback = callback;
    return this;
  },

  setError: function (error) {
    // Invoke this._errorCallback if present, the first time
    // the vis is instantiated and the're some errors
    if (this.get('state') === STATE_INIT) {
      this._errorCallback && this._errorCallback(error);
    }

    this.set({
      state: STATE_ERROR,
      error: error
    });
  },

  /**
   * @return Array of {LayerModel}
   */
  getLayers: function () {
    return _.clone(this.map.layers.models);
  },

  /**
   * @param {Integer} index Layer index (including base layer if present)
   * @return {LayerModel}
   */
  getLayer: function (index) {
    return this.map.layers.at(index);
  },

  load: function (vizjson) {
    // TODO: We're removing this method but clients of this class
    // are relying on the 'load' event to know when this class is
    // "ready" and instantiateMap can be invoked. For example:
    // https://github.com/CartoDB/deep-insights.js/blob/8d0601c6554b813503349b2aa593242a834cc2f0/src/api/create-dashboard.js#L71
    // We need to find an alternative way of doing this.
    _.defer(function () { this.trigger('load', this); }.bind(this));
  },

  // we provide a method to set some new settings
  setSettings: function (settings) {
    this.settings.set(settings);
  },

  _onMapInstanceCreated: function () {
    this._analysisPoller.reset();
    this._analysisCollection.each(function (analysisModel) {
      analysisModel.unbind('change:status', this._onAnalysisStatusChanged, this);
      if (analysisModel.url() && !analysisModel.isDone()) {
        this._analysisPoller.poll(analysisModel);
        this.trackLoadingObject(analysisModel);
        analysisModel.bind('change:status', this._onAnalysisStatusChanged, this);
      }
    }, this);
  },

  _onAnalysisStatusChanged: function (analysisModel) {
    if (analysisModel.isDone()) {
      this.untrackLoadingObject(analysisModel);
      if (this._isAnalysisSourceOfLayerOrDataview(analysisModel)) {
        this.reload();
      }
    }
  },

  _isAnalysisSourceOfLayerOrDataview: function (analysisModel) {
    var isAnalysisLinkedToLayer = this._layersCollection.any(function (layerModel) {
      return layerModel.get('source') === analysisModel.get('id');
    });
    var isAnalysisLinkedToDataview = this._dataviewsCollection.isAnalysisLinkedToDataview(analysisModel);
    return isAnalysisLinkedToLayer || isAnalysisLinkedToDataview;
  },

  trackLoadingObject: function (object) {
    if (this._loadingObjects.indexOf(object) === -1) {
      this._loadingObjects.push(object);
    }
    this.set('loading', true);
  },

  untrackLoadingObject: function (object) {
    var index = this._loadingObjects.indexOf(object);
    if (index >= 0) {
      this._loadingObjects.splice(index, 1);
      if (this._loadingObjects.length === 0) {
        this.set('loading', false);
      }
    }
  },

  /**
   * Force a map instantiation.
   * Only expected to be called once if {skipMapInstantiation} flag is set to true when vis is created.
   */
  instantiateMap: function (options) {
    options = options || {};
    if (this._instantiateMapWasCalled) {
      return;
    }
    this._instantiateMapWasCalled = true;

    this.reload({
      success: function () {
        options.success && options.success();
        this._onMapInstantiatedForTheFirstTime();
      }.bind(this),
      error: function () {
        options.error && options.error();
      },
      includeFilters: false
    });
  },

  _onMapInstantiatedForTheFirstTime: function () {
    var anyDataviewFiltered = this._isAnyDataviewFiltered();
    whenAllDataviewsFetched(this._dataviewsCollection, this._onDataviewFetched.bind(this));
    this._initBindsAfterFirstMapInstantiation();

    anyDataviewFiltered && this.reload({ includeFilters: anyDataviewFiltered });
  },

  _isAnyDataviewFiltered: function () {
    return this._dataviewsCollection.isAnyDataviewFiltered();
  },

  _onDataviewFetched: function () {
    this.trigger('dataviewsFetched');
  },

  reload: function (options) {
    options = options || {};
    var successCallback = options.success;
    var errorCallback = options.error;

    options = _.extend({
      includeFilters: true,
      success: function () {
        this.trigger('reloaded');
        successCallback && successCallback();
      }.bind(this),
      error: function () {
        errorCallback && errorCallback();
      }
    }, _.pick(options, 'sourceId', 'forceFetch', 'includeFilters'));

    if (this._instantiateMapWasCalled) {
      this.trigger('reload');
      this._getWindshaftMap().createInstance(options); // this reload method is call from other places
    }
  },

  _getWindshaftMap: function () {
    if (this._windshaftMap) return this._windshaftMap;
    if (!this._windshaftSettings) return; // Trigger error instead?

    var modelUpdater = new ModelUpdater({
      visModel: this,
      mapModel: this.map,
      layerGroupModel: this.layerGroupModel,
      layersCollection: this._layersCollection,
      dataviewsCollection: this._dataviewsCollection,
      analysisCollection: this._analysisCollection
    });

    var windshaftClient = new WindshaftClient(this._windshaftSettings);

    // Create the WindshaftMap
    var WindshaftMapClass = WindshaftAnonymousMap;
    if (this._windshaftSettings.templateName) {
      WindshaftMapClass = WindshaftNamedMap;
    }

    this._windshaftMap = new WindshaftMapClass({
      apiKey: this.get('apiKey'),
      authToken: this.get('authToken')
    }, {
        client: windshaftClient,
        modelUpdater: modelUpdater,
        windshaftSettings: this._windshaftSettings,
        dataviewsCollection: this._dataviewsCollection,
        layersCollection: this._layersCollection,
        analysisCollection: this._analysisCollection
      });
    this._windshaftMap.bind('instanceCreated', this._onMapInstanceCreated, this);

    return this._windshaftMap;
  },

  _initBindsAfterFirstMapInstantiation: function () {
    this._layersCollection.bind('reset', this._onLayersResetted, this);
    this._layersCollection.bind('add', this._onLayerAdded, this);
    this._layersCollection.bind('remove', this._onLayerRemoved, this);

    if (this._dataviewsCollection) {
      // When new dataviews are defined, a new instance of the map needs to be created
      this._dataviewsCollection.on('add reset remove', _.debounce(this.invalidateSize, 10), this);
      this.listenTo(this._dataviewsCollection, 'add', _.debounce(this._onDataviewAdded.bind(this), 10));
      this.listenTo(this._dataviewsCollection, 'remove', this._onDataviewRemoved);
    }
  },

  _onDataviewRemoved: function (dataviewModel) {
    if (dataviewModel.isFiltered()) {
      this.reload({
        sourceId: dataviewModel.getSourceId()
      });
    }
  },

  _onLayersResetted: function () {
    this.reload();
  },

  _onLayerAdded: function (layerModel, collection, opts) {
    opts = opts || {};
    if (!opts.silent) {
      this.reload({
        sourceId: layerModel.get('id')
      });
    }
  },

  _onLayerRemoved: function (layerModel, collection, opts) {
    opts = opts || {};
    if (!opts.silent) {
      this.reload({
        sourceId: layerModel.get('id')
      });
    }
  },

  _onDataviewAdded: function () {
    this.reload();
  },

  invalidateSize: function () {
    this.trigger('invalidateSize');
  },

  _flattenLayers: function (vizjsonLayers) {
    return _.chain(vizjsonLayers)
      .map(function (vizjsonLayer) {
        if (vizjsonLayer.type === 'layergroup') {
          return vizjsonLayer.options.layer_definition.layers;
        }

        if (vizjsonLayer.type === 'namedmap') {
          // Layers inside of a "namedmap" layer don't have a type, so we need to
          // add manually add it here, so that the factory knows what model should be created.
          return _.map(vizjsonLayer.options.named_map.layers, function (layer) {
            layer.type = 'CartoDB';
            return layer;
          });
        }

        return vizjsonLayer;
      })
      .flatten()
      .value();
  },

  addCustomOverlay: function (overlayView) {
    overlayView.type = 'custom';
    this.overlaysCollection.add(overlayView);
    return overlayView;
  },

  setLayers: function (vizjsonLayers) {
    // TODO: This can be removed once https://github.com/CartoDB/cartodb/pull/9118
    // will be merged and released. Leaving this here for backwards compatibility
    // and to make sure everything still works fine during the release and next
    // few moments (e.g: some viz.json files might be cached, etc.).
    var layersData = this._flattenLayers(vizjsonLayers);

    var layerModels = _.map(layersData, function (layerData, layerIndex) {
      _.extend(layerData, { order: layerIndex });
      return this._layersFactory.createLayer(layerData.type, layerData);
    }, this);

    this.map.layers.reset(layerModels);
  },
  /**
   * "Load" existing analyses from the viz.json. This will generate
   * the analyses graphs and index analysis nodes in the
   * collection of analysis
   */
  setAnalyses: function (vizjsonAnalyses) {
    if (vizjsonAnalyses) {
      _.each(vizjsonAnalyses, function (analysis) {
        this.analysis.analyse(analysis);
      }, this);
    }
  },

  setOverlays: function (vizjsonOverlays) {
    this.overlaysCollection.reset(vizjsonOverlays);
  },

  setMapAttributes: function (mapAttributes) {
    this.map.set(mapAttributes);
  }
});

module.exports = VisModel;
