var _ = require('underscore');
var Backbone = require('backbone');
var util = require('../core/util');
var Map = require('../geo/map');
var DataviewsFactory = require('../dataviews/dataviews-factory');
var DataviewsCollection = require('../dataviews/dataviews-collection');
var WindshaftClient = require('../windshaft/client');
var AnalysisService = require('../analysis/analysis-service');
var CartoDBLayerGroup = require('../geo/cartodb-layer-group');
var ModelUpdater = require('../windshaft-integration/model-updater');
var LayersCollection = require('../geo/map/layers');
var AnalysisPoller = require('../analysis/analysis-poller');
var LayersFactory = require('./layers-factory');
var SettingsModel = require('./settings');
var whenAllDataviewsFetched = require('./dataviews-tracker');
var RenderModes = require('../geo/render-modes');
var WindshaftMap = require('../windshaft/map-base');

var STATE_INIT = 'init'; // vis hasn't been sent to Windshaft
var STATE_OK = 'ok'; // vis has been sent to Windshaft and everything is ok
var STATE_ERROR = 'error'; // vis has been sent to Windshaft and there were some issues

var VisModel = Backbone.Model.extend({
  defaults: {
    loading: false,
    showEmptyInfowindowFields: false,
    state: STATE_INIT
  },

  initialize: function () {
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

    this._instantiateMapWasCalled = false;
    this.set('canIncludeFilters', false);
    this.listenTo(this, 'change:canIncludeFilters', this.reload);
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
    // Create the WindhaftClient
    var datasource = vizjson.datasource;

    var windshaftSettings = {
      urlTemplate: vizjson.datasource.maps_api_template,
      userName: vizjson.datasource.user_name,
      statTag: vizjson.datasource.stat_tag,
      apiKey: this.get('apiKey'),
      authToken: this.get('authToken'),
      templateName: vizjson.datasource.template_name
    };

    var windshaftClient = new WindshaftClient(windshaftSettings);

    // Create the public Analysis Factory
    // TODO: use only AnalysisService static methods without instance
    this.analysisService = new AnalysisService({
      apiKey: this.get('apiKey'),
      authToken: this.get('authToken'),
      analysisCollection: this._analysisCollection,
      vis: this
    });

    // Public namespace exposing public methods.
    this.analysis = {
      createAnalysis: this.analysisService.createAnalysis,
      findNodeById: function (id) {
        return AnalysisService.findNodeById(id, this._layersCollection, this._dataviewsCollection);
      }.bind(this)
    };

    var allowScrollInOptions = (vizjson.options && vizjson.options.scrollwheel) || vizjson.scrollwheel;
    // Create the Map
    var allowDragging = util.isMobileDevice() || vizjson.hasZoomOverlay() || allowScrollInOptions;

    // TODO: leave it as it was
    // var renderMode = RenderModes.AUTO;
    // if (vizjson.vector === true) {
    //   renderMode = RenderModes.VECTOR;
    // } else if (vizjson.vector === false) {
    //   renderMode = RenderModes.RASTER;
    // }

    var renderMode = RenderModes.RASTER;

    this.layersFactory = new LayersFactory({
      visModel: this,
      windshaftSettings: windshaftSettings
    });

    this.map = new Map({
      title: vizjson.title,
      description: vizjson.description,
      bounds: vizjson.bounds,
      center: vizjson.center,
      zoom: vizjson.zoom,
      scrollwheel: !!allowScrollInOptions,
      drag: allowDragging,
      provider: vizjson.map_provider,
      isFeatureInteractivityEnabled: this.get('interactiveFeatures'),
      renderMode: renderMode
    }, {
      layersCollection: this._layersCollection,
      layersFactory: this.layersFactory
    });

    this.listenTo(this.map, 'cartodbLayerMoved', this.reload);

    var modelUpdater = new ModelUpdater({
      visModel: this,
      mapModel: this.map,
      layerGroupModel: this.layerGroupModel,
      dataviewsCollection: this._dataviewsCollection,
      layersCollection: this._layersCollection
    });

    // Create the WindshaftMap
    this._windshaftMap = new WindshaftMap({
      apiKey: this.get('apiKey'),
      authToken: this.get('authToken'),
      statTag: datasource.stat_tag
    }, {
      client: windshaftClient,
      modelUpdater: modelUpdater,
      windshaftSettings: windshaftSettings,
      dataviewsCollection: this._dataviewsCollection,
      layersCollection: this._layersCollection,
      analysisCollection: this._analysisCollection
    });

    // Reset the collection of overlays
    this.overlaysCollection.reset(vizjson.overlays);

    // Create the public Dataview Factory
    // TODO: create dataviews more explicitly
    this.dataviews = new DataviewsFactory({
      apiKey: this.get('apiKey'),
      authToken: this.get('authToken')
    }, {
      map: this.map,
      vis: this,
      dataviewsCollection: this._dataviewsCollection
    });

    // Create layers
    var analysisNodes = this._createAnalysisNodes(vizjson.analyses);
    var layerModels = this._createLayers(vizjson.layers, analysisNodes);
    this.map.layers.reset(layerModels);

    // Global variable for easier console debugging / testing
    window.vis = this;

    _.defer(function () {
      this.trigger('load', this);
    }.bind(this));
  },

  // we provide a method to set some new settings
  setSettings: function (settings) {
    this.settings.set(settings);
  },

  _restartAnalysisPolling: function () {
    this._analysisPoller.resetAnalysisNodes(this._getAnalysisNodeModels());
  },

  _getAnalysisNodeModels: function () {
    return AnalysisService.getUniqueAnalysesNodes(this._layersCollection, this._dataviewsCollection);
  },

  /**
   * Check if an analysis is the source of any layer.
   */
  _isAnalysisLinkedToLayer: function (analysisModel) {
    return this._layersCollection.any(function (layerModel) {
      return layerModel.hasSource(analysisModel);
    });
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
        this._onMapInstantiatedForTheFirstTime();
        options.success && options.success();
      }.bind(this),
      error: function () {
        options.error && options.error();
      },
      includeFilters: false
    });
  },

  _onMapInstantiatedForTheFirstTime: function () {
    this._initBindsAfterFirstMapInstantiation();
    whenAllDataviewsFetched(this._dataviewsCollection, this._onAllDataviewsFetched.bind(this));
  },

  _onAllDataviewsFetched: function () {
    if (this._dataviewsCollection.length > 0) {
      this.trigger('dataviewsFetched');
    }
    this.set('canIncludeFilters', true);
  },

  reload: function (options) {
    options = options || {};
    var successCallback = options.success;
    var errorCallback = options.error;

    // Every reload caused by a change in filters before we can include filters
    // in the instantiation is aborted.
    if (options.reason === 'filtersChanged' && !this.get('canIncludeFilters')) {
      return;
    }

    options = _.extend({
      includeFilters: true,
      success: function () {
        this.trigger('reloaded');
        this._restartAnalysisPolling();

        var analysisNodes = this._getAnalysisNodeModels();
        if (this._isAnyAnalysisNodeLoading(analysisNodes)) {
          this.trackLoadingObject(this);
        } else {
          this.untrackLoadingObject(this);
        }
        successCallback && successCallback();
      }.bind(this),
      error: function () {
        errorCallback && errorCallback();
      }
    },
    _.pick(options, 'sourceId', 'forceFetch', 'includeFilters'), {
      includeFilters: this.get('canIncludeFilters')
    });
    if (this._instantiateMapWasCalled) {
      this.trigger('reload');
      this._windshaftMap.createInstance(options); // this reload method is call from other places
    }
  },

  _isAnyAnalysisNodeLoading: function (analysisNodes) {
    return _.any(analysisNodes, function (analysisModel) {
      return analysisModel.isLoading();
    });
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
    this.trigger('mapInstantiated');
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

  addCustomOverlay: function (overlayView) {
    overlayView.type = 'custom';
    this.overlaysCollection.add(overlayView);
    return overlayView;
  },

  isLoading: function () {
    return this.get('loading');
  },

  /**
   * "Load" existing analyses from the viz.json. This will generate
   * the analyses graphs and index analysis nodes in the
   * collection of analysis
   */
  _createAnalysisNodes: function (analysesDefinition) {
    var analysisNodes = {};
    var analysisRoots = [];
    if (analysesDefinition) {
      _.each(analysesDefinition, function (analysisDefinition) {
        analysisRoots.push(this.analysisService.createAnalysis(analysisDefinition));
      }, this);

      _.each(analysisRoots, function (analysisRoot) {
        _.each(analysisRoot.getNodes(), function (analysisNode) {
          analysisNodes[analysisNode.get('id')] = analysisNode;
          // TODO: remove
          this._analysisCollection.add(analysisNode);
        }, this);
      }, this);
    }
    return analysisNodes;
  },

  _createLayers: function (layersDefinition, analysisNodes) {
    var layers = _.map(layersDefinition, function (layerData, layerIndex) {
      // Flatten "options" and set the "order" attribute
      layerData = _.extend({},
        _.omit(layerData, 'options'),
        layerData.options, {
          order: layerIndex
        }
      );

      if (layerData.source) {
        var source = analysisNodes[layerData.source];
        if (!source) {
          throw new Error('Can not find analysis id: ' + layerData.source);
        }
        layerData.source = source;
      } else {
        // TODO: We'll be able to remove this (accepting sql option) once
        // https://github.com/CartoDB/cartodb.js/issues/1754 is closed.
        if (layerData.sql) {
          layerData.source = this.analysisService.createSourceAnalysisForLayer(layerData.id, layerData.sql);
          delete layerData.sql;
        }
      }
      return this.layersFactory.createLayer(layerData.type, layerData);
    }, this);
    return layers;
  }
});

module.exports = VisModel;
