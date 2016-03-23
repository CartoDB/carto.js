var _ = require('underscore');
var Backbone = require('backbone');
var $ = require('jquery');
var log = require('cdb.log');
var util = require('cdb.core.util');
var Loader = require('../core/loader');
var View = require('../core/view');
var StackedLegend = require('../geo/ui/legend/stacked-legend');
var Map = require('../geo/map');
var MapViewFactory = require('../geo/map-view-factory');
var LegendModel = require('../geo/ui/legend-model');
var Legend = require('../geo/ui/legend');
var InfowindowModel = require('../geo/ui/infowindow-model');
var Infowindow = require('../geo/ui/infowindow');
var Template = require('../core/template');
var Layers = require('./vis/layers');
var Overlay = require('./vis/overlay');
var INFOWINDOW_TEMPLATE = require('./vis/infowindow-template');
var DataviewsFactory = require('../dataviews/dataviews-factory');
var DataviewCollection = require('../dataviews/dataviews-collection');
var InfowindowManager = require('./infowindow-manager');
var TooltipManager = require('./tooltip-manager');
var WindshaftConfig = require('../windshaft/config');
var WindshaftClient = require('../windshaft/client');
var WindshaftLayerGroupConfig = require('../windshaft/layergroup-config');
var WindshaftNamedMapConfig = require('../windshaft/namedmap-config');
var WindshaftMap = require('../windshaft/windshaft-map');
var VizJSON = require('./vizjson');
var LAYER_TYPES = require('./layer-types');

/**
 * Visualization creation
 */
var Vis = View.extend({
  initialize: function () {
    _.bindAll(this, 'loadingTiles', 'loadTiles', '_onResize');

    this.overlays = [];

    if (this.options.mapView) {
      this.mapView = this.options.mapView;
      this.map = this.mapView.map;
    }
  },

  _addLegends: function (legends) {
    if (this.legends) {
      this.legends.remove();
    }

    this.legends = new StackedLegend({
      legends: legends
    });

    this.mapView.addOverlay(this.legends);
  },

  addLegends: function (layers) {
    this._addLegends(this.createLegendView(layers));
  },

  _setLayerOptions: function (options) {
    var layers = [];

    // flatten layers (except baselayer)
    var layers = _.map(this.getLayers().slice(1), function (layer) {
      if (layer.getSubLayers) {
        return layer.getSubLayers();
      }
      return layer;
    });

    layers = _.flatten(layers);

    for (i = 0; i < Math.min(options.sublayer_options.length, layers.length); ++i) {
      var o = options.sublayer_options[i];
      var subLayer = layers[i];
      var legend = this.legends && this.legends.getLegendByIndex(i);

      if (legend) {
        legend[o.visible ? 'show' : 'hide']();
      }

      // HACK
      if (subLayer.model && subLayer.model.get('type') === 'torque') {
        if (o.visible === false) {
          subLayer.model.set('visible', false);
        }
      }
    }
  },

  _addOverlays: function (overlays, data, options) {
    overlays = overlays.toJSON();
    // Sort the overlays by its internal order
    overlays = _.sortBy(overlays, function (overlay) {
      return overlay.order === null ? Number.MAX_VALUE : overlay.order;
    });

    // clean current overlays
    while (this.overlays.length !== 0) {
      this.overlays.pop().clean();
    }

    this._createOverlays(overlays, data, options);
  },

  _createOverlays: function (overlays, vis_data, options) {
    _(overlays).each(function (data) {
      var type = data.type;

      // IE<10 doesn't support the Fullscreen API
      if (type === 'fullscreen' && util.browser.ie && util.browser.ie.version <= 10) return;

      // Decide to create or not the custom overlays
      if (type === 'image' || type === 'text' || type === 'annotation') {
        var isDevice = data.options.device == 'mobile' ? true : false;
        if (this.mobile !== isDevice) return;
        if (!options[type] && options[type] !== undefined) {
          return;
        }
      }

      // We add the header overlay
      if (type === 'header') {
        var overlay = this._addHeader(data, vis_data);
      } else {
        var overlay = this.addOverlay(data);
      }

      // We show/hide the overlays
      if (overlay && (type in options) && options[type] === false) overlay.hide();

      var opt = data.options;

      if (type == 'layer_selector' && options[type] || type == 'layer_selector' && overlay.model.get('display') && options[type] == undefined) {
        overlay.show();
      }

      if (type == 'fullscreen' && options[type] || type == 'fullscreen' && opt.display && options[type] == undefined) {
        overlay.show();
      }

      if (type == 'search' && options[type] || type == 'search' && opt.display && options[type] == undefined) {
        overlay.show();
      }

      if (type === 'header') {
        var m = overlay.model;

        if (options.title !== undefined) {
          m.set('show_title', options.title);
        }

        if (options.description !== undefined) {
          m.set('show_description', options.description);
        }

        if (m.get('show_title') || m.get('show_description')) {
          $('.cartodb-map-wrapper').addClass('with_header');
        }

        overlay.render();
      }
    }, this);
  },

  _setupSublayers: function (layers, options) {
    options.sublayer_options = [];

    _.each(layers.slice(1), function (lyr) {
      if (lyr.type === 'layergroup') {
        _.each(lyr.options.layer_definition.layers, function (l) {
          options.sublayer_options.push({ visible: ( l.visible !== undefined ? l.visible : true) });
        });
      } else if (lyr.type === 'namedmap') {
        _.each(lyr.options.named_map.layers, function (l) {
          options.sublayer_options.push({ visible: ( l.visible !== undefined ? l.visible : true) });
        });
      } else if (lyr.type === 'torque') {
        options.sublayer_options.push({ visible: ( lyr.options.visible !== undefined ? lyr.options.visible : true) });
      }
    });
  },

  load: function (data, options) {
    if (typeof (data) === 'string') {
      var url = data;
      Loader.get(url, function (data) {
        if (data) {
          this.load(data, options);
        } else {
          this.throwError('error fetching viz.json file');
        }
      }.bind(this));

      return;
    }

    var DEFAULT_OPTIONS = {
      tiles_loader: true,
      loaderControl: true,
      infowindow: true,
      tooltip: true,
      time_slider: true
    };

    options = _.defaults(options || {}, DEFAULT_OPTIONS);
    var vizjson = new VizJSON(data);
    this._applyOptionsToVizJSON(vizjson, options);

    this._dataviewsCollection = new DataviewCollection();

    // Create the WindhaftClient

    var endpoint;
    var configGenerator;
    var datasource = vizjson.datasource;

    // TODO: We can use something else to differentiate types of "datasource"s
    if (datasource.template_name) {
      endpoint = [WindshaftConfig.MAPS_API_BASE_URL, 'named', datasource.template_name].join('/');
      configGenerator = WindshaftNamedMapConfig;
    } else {
      endpoint = WindshaftConfig.MAPS_API_BASE_URL;
      configGenerator = WindshaftLayerGroupConfig;
    }

    var windshaftClient = new WindshaftClient({
      endpoint: endpoint,
      urlTemplate: datasource.maps_api_template,
      userName: datasource.user_name,
      forceCors: datasource.force_cors || true
    });

    // Create the WindshaftMap

    var windshaftMap = new WindshaftMap(null, { // eslint-disable-line
      client: windshaftClient,
      configGenerator: configGenerator,
      statTag: datasource.stat_tag
    });

    // Create the Map

    var allowDragging = util.isMobileDevice() || vizjson.hasZoomOverlay() || vizjson.scrollwheel;
    var center = vizjson.center;
    if (typeof (center) === 'string') {
      center = $.parseJSON(center);
    }

    var mapConfig = {
      title: vizjson.title,
      description: vizjson.description,
      maxZoom: vizjson.maxZoom,
      minZoom: vizjson.minZoom,
      legends: vizjson.legends,
      bounds: vizjson.bounds,
      center: center,
      zoom: vizjson.zoom,
      scrollwheel: !!this.scrollwheel,
      drag: allowDragging,
      provider: vizjson.map_provider,
      vector: vizjson.vector
    };

    this.map = new Map(mapConfig, {
      windshaftMap: windshaftMap,
      dataviewsCollection: this._dataviewsCollection
    });

    // If a CartoDB embed map is hidden by default, its
    // height is 0 and it will need to recalculate its size
    // and re-center again.
    // We will wait until it is resized and then apply
    // the center provided in the parameters and the
    // correct size.
    var map_h = this.$el.outerHeight();

    if (map_h === 0) {
      $(window).bind('resize', this._onResize);
    }

    // Create the MapView

    var div = $('<div>').css({
      position: 'relative',
      width: '100%',
      height: '100%'
    });

    this.container = div;

    // Another div to prevent leaflet grabbing the div
    var div_hack = $('<div>')
      .addClass('cartodb-map-wrapper')
      .css({
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%'
      });

    div.append(div_hack);

    this.$el.append(div);

    var mapViewFactory = new MapViewFactory();
    this.mapView = mapViewFactory.createMapView(this.map.get('provider'), this.map, div_hack);

    // Bindings

    if (options.legends || (options.legends === undefined && this.map.get('legends') !== false)) {
      this.map.layers.bind('reset', this.addLegends, this);
    }

    this.mapView.bind('newLayerView', this._addLoading, this);

    // Create the Layer Models and set them on hte map
    this.https = (window && window.location.protocol && window.location.protocol === 'https:') || !!vizjson.https || !!options.https;
    var layerModels = this._newLayerModels(data, this.map);

    var infowindowManager = new InfowindowManager(this);
    infowindowManager.manage(this.mapView, this.map);

    var tooltipManager = new TooltipManager(this);
    tooltipManager.manage(this.mapView, this.map);

    // Create the collection of Overlays
    var overlaysCollection = new Backbone.Collection();
    overlaysCollection.bind('reset', function (overlays) {
      this._addOverlays(overlays, data, options);
    }, this);
    overlaysCollection.reset(vizjson.overlays);

    // Create the public Dataview Factory
    this.dataviews = new DataviewsFactory(null, {
      dataviewsCollection: this._dataviewsCollection,
      layersCollection: this.map.layers,
      map: this.map,
      windshaftMap: windshaftMap
    });

    if (!options.skipMapInstantiation) {
      this.instantiateMap();
    }

    // Lastly: reset the layer models on the map
    this.map.layers.reset(layerModels);

    // Global variable for easier console debugging / testing
    window.vis = this;

    return this;
  },

  _applyOptionsToVizJSON: function (vizjson, options) {
    vizjson.scrollwheel = options.scrollwheel || vizjson.scrollwheel;

    if (!options.tiles_loader || !options.loaderControl) {
      vizjson.removeLoaderOverlay();
    }

    if (options.searchControl === true) {
      vizjson.addSearchOverlay();
    } else if (options.searchControl === false) {
      vizjson.removeSearchOverlay();
    }

    if ((options.title && vizjson.title) || (options.description && vizjson.description)) {
      vizjson.addHeaderOverlay(options.title, options.description, options.shareable);
    }

    if (options.layer_selector) {
      vizjson.addLayerSelectorOverlay();
    }

    if (options.zoomControl !== undefined && !options.zoomControl) {
      vizjson.removeZoomOverlay();
    }

    // if bounds are present zoom and center will not taken into account
    var zoom = parseInt(options.zoom, 10);
    if (!isNaN(zoom)) {
      vizjson.setZoom(zoom);
    }

    // Center coordinates?
    var center_lat = parseFloat(options.center_lat);
    var center_lon = parseFloat(options.center_lon);
    if (!isNaN(center_lat) && !isNaN(center_lon)) {
      vizjson.setCenter([center_lat, center_lon]);
    }

    // Center object
    if (options.center !== undefined) {
      vizjson.setCenter(options.center);
    }

    // Bounds?
    var sw_lat = parseFloat(options.sw_lat);
    var sw_lon = parseFloat(options.sw_lon);
    var ne_lat = parseFloat(options.ne_lat);
    var ne_lon = parseFloat(options.ne_lon);

    if (!isNaN(sw_lat) && !isNaN(sw_lon) && !isNaN(ne_lat) && !isNaN(ne_lon)) {
      vizjson.setBounds([
        [ sw_lat, sw_lon ],
        [ ne_lat, ne_lon ]
      ]);
    }

    if (options.gmaps_base_type) {
      vizjson.enforceGMapsBaseLayer(options.gmaps_base_type, options.gmaps_style);
    }
  },

  /**
   * Force a map instantiation.
   * Only expected to be called if {skipMapInstantiation} flag is set to true when vis is created.
   */
  instantiateMap: function () {
    var self = this;
    this._dataviewsCollection.on('add reset remove', _.debounce(this._invalidateSizeOnDataviewsChanges, 10), this);
    this.map.instantiateMap();

    // Trigger 'done' event
    _.defer(function () {
      self.trigger('done', self, self.map.layers);
    });
  },

  centerMapToOrigin: function () {
    this.mapView.invalidateSize();
    this.map.reCenter();
  },

  _newLayerModels: function (vizjson, map) {
    var layerModels = [];
    var layersOptions = {
      https: this.https,
      map: map
    };
    _.each(vizjson.layers, function (layerData) {
      if (layerData.type === 'layergroup' || layerData.type === 'namedmap') {
        var layersData;
        if (layerData.type === 'layergroup') {
          layersData = layerData.options.layer_definition.layers;
        } else {
          layersData = layerData.options.named_map.layers;
        }
        _.each(layersData, function (layerData) {
          layerModels.push(Layers.create(LAYER_TYPES.CARTODB, layerData, layersOptions));
        });
      } else {
        layerModels.push(Layers.create(layerData.type, layerData, layersOptions));
      }
    });

    return layerModels;
  },

  _invalidateSizeOnDataviewsChanges: function () {
    if (this._dataviewsCollection.size() > 0) {
      this.mapView.invalidateSize();
    }
  },

  _addHeader: function (data, vis_data) {
    return this.addOverlay({
      type: 'header',
      options: data.options
    });
  },

  _createLegendView: function (layer, layerView) {
    if (layer.legend) {
      layer.legend.data = layer.legend.items;
      var legend = layer.legend;

      if ((legend.items && legend.items.length) || legend.template) {
        var legendAttrs = _.extend(layer.legend, {
          visible: layer.visible
        });
        var legendModel = new LegendModel(legendAttrs);
        var legendView = new Legend({ model: legendModel });
        layerView.bind('change:visibility', function (layer, hidden) {
          legendView[hidden ? 'hide' : 'show']();
        });
        layerView.legend = legendModel;
        return legendView;
      }
    }
    return null;
  },

  createLegendView: function (layers) {
    var legends = [];
    var self = this;
    for (var i = layers.length - 1; i >= 0; --i) {
      var cid = layers.at(i).cid;
      var layer = layers.at(i).attributes;
      if (layer.visible) {
        var layerView = this.mapView.getLayerViewByLayerCid(cid);
        if (layerView) {
          var layerView = this.mapView.getLayerViewByLayerCid(cid);
          legends.push(this._createLayerLegendView(layer, layerView));
        }
      }
    }
    return _.flatten(legends);
  },

  _createLayerLegendView: function (layer, layerView) {
    var self = this;
    var legends = [];
    if (layer.options && layer.options.layer_definition) {
      var sublayers = layer.options.layer_definition.layers;
      _(sublayers).each(function (sub, i) {
        legends.push(self._createLegendView(sub, layerView.getSubLayer(i)));
      });
    } else if (layer.options && layer.options.named_map && layer.options.named_map.layers) {
      var sublayers = layer.options.named_map.layers;
      _(sublayers).each(function (sub, i) {
        legends.push(self._createLegendView(sub, layerView.getSubLayer(i)));
      });
    } else {
      legends.push(this._createLegendView(layer, layerView));
    }
    return _.compact(legends).reverse();
  },

  addOverlay: function (overlay) {
    overlay.map = this.map;

    var v = Overlay.create(overlay.type, this, overlay);

    if (v) {
      // Save tiles loader view for later
      if (overlay.type == 'loader') {
        this.loader = v;
      }

      this.mapView.addOverlay(v);

      this.overlays.push(v);

      v.bind('clean', function () {
        for (var i in this.overlays) {
          var o = this.overlays[i];
          if (v.cid === o.cid) {
            this.overlays.splice(i, 1);
            return;
          }
        }
      }, this);
    }
    return v;
  },

  createLayer: function (layerData) {
    var layerModel = Layers.create(layerData.type || layerData.kind, this, layerData);
    return this.mapView.createLayer(layerModel);
  },

  _addLoading: function (layerView) {
    if (layerView) {
      var self = this;

      var loadingTiles = function () {
        self.loadingTiles();
      };

      var loadTiles = function () {
        self.loadTiles();
      };

      layerView.bind('loading', loadingTiles);
      layerView.bind('load', loadTiles);
    }
  },

  loadingTiles: function () {
    if (this.loader) {
      this.loader.show();
    }
    if (this.layersLoading === 0) {
      this.trigger('loading');
    }
    this.layersLoading++;
  },

  loadTiles: function () {
    if (this.loader) {
      this.loader.hide();
    }
    this.layersLoading--;
    // check less than 0 because loading event sometimes is
    // thrown before visualization creation
    if (this.layersLoading <= 0) {
      this.layersLoading = 0;
      this.trigger('load');
    }
  },

  throwError: function (msg, lyr) {
    log.error(msg);
    var self = this;
    _.defer(function () {
      self.trigger('error', msg, lyr);
    });
  },

  error: function (fn) {
    return this.bind('error', fn);
  },

  done: function (fn) {
    return this.bind('done', fn);
  },

  // public methods
  //

  // get the native map used behind the scenes
  getNativeMap: function () {
    return this.mapView.getNativeMap();
  },

  // returns an array of layers
  // TODO: Rename to getLayerViews
  getLayers: function () {
    var self = this;
    return _.compact(this.map.layers.map(function (layer) {
      return self.mapView.getLayerViewByLayerCid(layer.cid);
    }));
  },

  getOverlays: function () {
    return this.overlays;
  },

  getOverlay: function (type) {
    return _(this.overlays).find(function (v) {
      return v.type == type;
    });
  },

  getOverlaysByType: function (type) {
    return _(this.overlays).filter(function (v) {
      return v.type == type;
    });
  },

  _onResize: function () {
    $(window).unbind('resize', this._onResize);

    var self = this;
    // This timeout is necessary due to GMaps needs time
    // to load tiles and recalculate its bounds :S
    setTimeout(function () {
      self.centerMapToOrigin();
    }, 150);
  }
}, {
  /**
   * adds an infowindow to the map controlled by layer events.
   * it enables interaction and overrides the layer interacivity
   * ``fields`` array of column names
   * ``map`` native map object, leaflet of gmaps
   * ``layer`` cartodb layer (or sublayer)
   */
  addInfowindow: function (map, layer, fields, opts) {
    var options = _.defaults(opts || {}, {
      infowindowTemplate: INFOWINDOW_TEMPLATE.light,
      templateType: 'mustache',
      triggerEvent: 'featureClick',
      templateName: 'light',
      extraFields: [],
      cursorInteraction: true
    });

    if (!map) throw new Error('map is not valid');
    if (!layer) throw new Error('layer is not valid');
    if (!fields && fields.length === undefined) throw new Error('fields should be a list of strings');

    var f = [];
    fields = fields.concat(options.extraFields);
    for (var i = 0; i < fields.length; ++i) {
      f.push({ name: fields, order: i});
    }

    var infowindowModel = new InfowindowModel({
      fields: f,
      template_name: options.templateName
    });

    var infowindow = new Infowindow({
      model: infowindowModel,
      mapView: map.viz.mapView,
      template: new Template({
        template: options.infowindowTemplate,
        type: options.templateType
      }).asFunction()
    });

    map.viz.mapView.addInfowindow(infowindow);

    layer.bind(options.triggerEvent, function (e, latlng, pos, data, layer) {
      var render_fields = [];
      var d;
      for (var f = 0; f < fields.length; ++f) {
        var field = fields[f];
        if (d = data[field]) {
          render_fields.push({
            title: field,
            value: d,
            index: 0
          });
        }
      }

      infowindow.model.set({
        content: {
          fields: render_fields,
          data: data
        }
      });

      infowindow
        .setLatLng(latlng)
        .showInfowindow();
      infowindow.adjustPan();
    }, infowindow);

    // remove the callback on clean
    infowindow.bind('clean', function () {
      layer.unbind(options.triggerEvent, null, infowindow);
    });

    if (options.cursorInteraction) {
      Vis.addCursorInteraction(map, layer);
    }

    return infowindow;
  },

  addCursorInteraction: function (map, layer) {
    var mapView = map.viz.mapView;
    layer.bind('mouseover', function () {
      mapView.setCursor('pointer');
    });

    layer.bind('mouseout', function (m, layer) {
      mapView.setCursor('auto');
    });
  },

  removeCursorInteraction: function (map, layer) {
    var mapView = map.viz.mapView;
    layer.unbind(null, null, mapView);
  }
});

module.exports = Vis;
