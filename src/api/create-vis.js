var _ = require('underscore');
var VisView = require('../vis/vis-view');
var VisModel = require('../vis/vis');
var Loader = require('../core/loader');
var VizJSON = require('./vizjson');
var config = require('../cdb.config');
var util = require('../core/util');
var RenderModes = require('../geo/render-modes');

var DEFAULT_OPTIONS = {
  tiles_loader: true,
  loaderControl: true,
  infowindow: true, // TODO: it seems that this is no longer used
  tooltip: true, // TODO: it seems that this is no longer used
  logo: true,
  show_empty_infowindow_fields: false,
  interactiveFeatures: false
};

/**
 * Return a promise with a visModel when the vizjson is a url
 * or a visModel when the vizjson is already a parsed object.
 */
var createVis = function (el, vizjson, options) {
  if (!el) {
    throw new TypeError('a valid DOM element or selector must be provided');
  }
  if (typeof el === 'string') {
    el = document.getElementById(el);
  }
  if (!vizjson) {
    throw new TypeError('a vizjson URL or object must be provided');
  }
  //TODO: ¿should we make createVis sync only? 
  if (typeof vizjson === 'object') {
    return _createVisSync(el, vizjson, options);
  }
  return fetch(vizjson)
    .then(function (data) {
      return data.json();
    })
    .then(function (visJson) {
      return _createVisSync(el, visJson, options);
    });
};

/**
 * Return a visModel given an element a visjson object and the visualization options.
 */
function _createVisSync(el, visjson, options) {
  var isProtocolHTTPs = window && window.location.protocol && window.location.protocol === 'https:';
  options = _.defaults(options || {}, DEFAULT_OPTIONS);

  var visModel = new VisModel({
    apiKey: options.apiKey,
    authToken: options.authToken,
    showEmptyInfowindowFields: options.show_empty_infowindow_fields === true,
    https: isProtocolHTTPs || options.https === true,
    interactiveFeatures: options.interactiveFeatures
  });

  new VisView({
    el: el,
    model: visModel,
    settingsModel: visModel.settings
  });

  loadVizJSON(el, visModel, visjson, options);

  if (options.mapzenApiKey) {
    config.set('mapzenApiKey', options.mapzenApiKey);
  }

  return visModel;
}

var loadVizJSON = function (el, visModel, vizjsonData, options) {
  var vizjson = new VizJSON(vizjsonData);
  applyOptionsToVizJSON(vizjson, options);

  visModel.set({
    title: vizjson.title,
    description: vizjson.description,
    https: visModel.get('https') || vizjson.https === true
  });

  visModel.setSettings(_loadSettings(vizjson, options));
  visModel.setWindshaftSettings(getWindshaftSettings(vizjson, options));
  visModel.setMapAttributes(getMapAttributes(vizjson, options));
  visModel.setOverlays(vizjson.overlays);
  visModel.setLayers(vizjson.layers);
  visModel.setAnalyses(vizjson.analyses);
  visModel.load(vizjson); //TODO: remove the load method

  if (!options.skipMapInstantiation) {
    visModel.instantiateMap();
  }
};

var applyOptionsToVizJSON = function (vizjson, options) {
  vizjson.options = vizjson.options || {};
  vizjson.options.scrollwheel = options.scrollwheel || vizjson.options.scrollwheel;

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

  if (options.zoomControl !== undefined && !options.zoomControl) {
    vizjson.removeZoomOverlay();
  }

  if (options.logo === false) {
    vizjson.removeLogoOverlay();
  }

  if (_.has(options, 'vector')) {
    vizjson.setVector(options.vector);
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
      [sw_lat, sw_lon],
      [ne_lat, ne_lon]
    ]);
  }

  if (options.gmaps_base_type) {
    vizjson.enforceGMapsBaseLayer(options.gmaps_base_type, options.gmaps_style);
  }
};

function _loadSettings(vizjson, options) {
  var settings = {
    showLegends: true,
    showLayerSelector: true,
    layerSelectorEnabled: true,
  };

  if (_.isBoolean(options.legends)) {
    settings.showLegends = options.legends;
  } else if (vizjson.options && _.isBoolean(vizjson.options.legends)) {
    settings.showLegends = vizjson.options.legends;
  }

  if (_.isBoolean(options.layer_selector)) {
    settings.showLayerSelector = options.layer_selector;
  } else if (vizjson.options && _.isBoolean(vizjson.options.layer_selector)) {
    settings.showLayerSelector = vizjson.options.layer_selector;
  }

  if (_.isBoolean(options.layerSelectorEnabled)) {
    settings.layerSelectorEnabled = options.layerSelectorEnabled;
  }

  return settings;
}

var getWindshaftSettings = function (vizjson, options) {
  var windshaftSettings = {
    urlTemplate: vizjson.datasource.maps_api_template,
    userName: vizjson.datasource.user_name,
    statTag: vizjson.datasource.stat_tag,
    apiKey: options.apiKey,
    authToken: options.authToken
  };

  if (vizjson.isNamedMap()) {
    windshaftSettings.templateName = vizjson.datasource.template_name;
  }

  return windshaftSettings;
};

var getMapAttributes = function (vizjson, options) {
  var allowDragging = util.isMobileDevice() || vizjson.hasZoomOverlay() || vizjson.options.scrollwheel;

  var renderMode = RenderModes.AUTO;
  if (vizjson.vector === true) {
    renderMode = RenderModes.VECTOR;
  } else if (vizjson.vector === false) {
    renderMode = RenderModes.RASTER;
  }

  var center = vizjson.center;
  if (typeof center === 'string') {
    center = JSON.parse(center);
  }

  var mapAttributes = {
    title: vizjson.title,
    description: vizjson.description,
    center: center,
    zoom: vizjson.zoom,
    scrollwheel: !!vizjson.options.scrollwheel,
    drag: allowDragging,
    renderMode: renderMode
  };

  if (vizjson.map_provider) {
    _.extend(mapAttributes, {
      provider: vizjson.map_provider
    });
  }

  if (Array.isArray(vizjson.bounds)) {
    _.extend(mapAttributes, {
      view_bounds_sw: vizjson.bounds[0],
      view_bounds_ne: vizjson.bounds[1]
    });
  }

  return mapAttributes;
};

module.exports = createVis;
