var Backbone = require('backbone');
var _ = require('underscore');
var WindshaftFiltersCollection = require('./filters/collection');
var WindshaftLayerGroupConfig = require('./layergroup-config');
var WindshaftNamedMapConfig = require('./namedmap-config');
var WindshaftConfig = require('./config');
var EMPTY_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
var LAYER_TYPES = require('../vis/layer-types');
var WindshaftMap = Backbone.Model.extend({

  initialize: function (attrs, options) {
    this.client = options.client;
    this.statTag = options.statTag;
    this.configGenerator = options.configGenerator;

    // TODO: What params are really used?
    this.pngParams = ['map_key', 'api_key', 'cache_policy', 'updated_at'];
    this.gridParams = ['map_key', 'api_key', 'cache_policy', 'updated_at'];

    this.set({
      urlTemplate: this.client.urlTemplate,
      userName: this.client.userName
    });
  },

  isNamedMap: function () {
    return this.configGenerator === WindshaftNamedMapConfig;
  },

  isAnonymousMap: function () {
    return this.configGenerator === WindshaftLayerGroupConfig;
  },

  createInstance: function (options) {
    options = options || {};
    // WindshaftMap knows what types of layers should be sent to Windshaft:
    var layers = _.select(options.layers, function (layer) {
      return layer.get('type') === LAYER_TYPES.CARTODB || layer.get('type') === LAYER_TYPES.TORQUE;
    });
    var dataviews = options.dataviews;
    var sourceLayerId = options.sourceLayerId;
    var forceFetch = options.forceFetch;

    var mapConfig = this.configGenerator.generate({
      layers: layers,
      dataviews: dataviews
    });

    var filtersFromVisibleLayers = [];
    if (dataviews) {
      filtersFromVisibleLayers = dataviews.chain()
        .filter(function (dataview) {
          return dataview.layer.isVisible();
        })
        .map(function (dataview) {
          return dataview.filter;
        })
        .compact() // not all dataviews have filters
        .value();
    }

    var filters = new WindshaftFiltersCollection(filtersFromVisibleLayers, layers);

    this.client.instantiateMap({
      mapDefinition: mapConfig,
      statTag: this.statTag,
      filters: filters.toJSON(),
      success: function (mapInstance) {
        this.set(mapInstance);
        _.each(layers, function (layer, layerIndex) {
          if (layer.get('type') === LAYER_TYPES.TORQUE) {
            layer.set('meta', this.getLayerMeta(layerIndex));
            layer.set('urls', this.getTiles('torque'));
          } else if (layer.get('type') === LAYER_TYPES.CARTODB) {
            layer.set('meta', this.getLayerMeta(layerIndex));
          }
        }, this);
        this.trigger('instanceCreated', this, sourceLayerId, forceFetch);
      }.bind(this),
      error: function (error) {
        console.log('Error creating the map instance on Windshaft: ' + error);
      }
    });

    return this;
  },

  TILE_EXTENSIONS_BY_LAYER_TYPE: {
    'mapnik': '.png',
    'torque': '.json.torque'
  },

  getBaseURL: function (subhost) {
    return [
      this._getHost(subhost),
      WindshaftConfig.MAPS_API_BASE_URL,
      this.get('layergroupid')
    ].join('/');
  },

  _getHost: function (subhost) {
    var userName = this.get('userName');
    var protocol = this._useHTTPS() ? 'https' : 'http';
    subhost = subhost ? subhost + '.' : '';
    var host = this.get('urlTemplate').replace('{user}', userName);
    var cdnHost = this.get('cdn_url') && this.get('cdn_url')[protocol];
    if (cdnHost) {
      host = [protocol, '://', subhost, cdnHost, '/', userName].join('');
    }

    return host;
  },

  _useHTTPS: function () {
    return this.get('urlTemplate').indexOf('https') === 0;
  },

  getDataviewURL: function (options) {
    var dataviewId = options.dataviewId;
    var protocol = options.protocol;
    var url;
    var layers = this.get('metadata') && this.get('metadata').layers;

    _.each(layers, function (layer) {
      // TODO layer.widgets is the raw data returned from metadata… should be renamed once the result from Windshaft is changed
      var dataviews = layer.widgets;
      for (var id in dataviews) {
        if (dataviewId === id) {
          url = dataviews[id].url[protocol];
          return;
        }
      }
    });

    return url;
  },

  getTiles: function (layerType, params) {
    layerType = layerType || 'mapnik';
    var grids = [];
    var tiles = [];

    var pngParams = this._encodeParams(params, this.pngParams);
    var gridParams = this._encodeParams(params, this.gridParams);

    var subdomains = ['0', '1', '2', '3'];
    if (this._useHTTPS()) {
      subdomains = [''];
    }

    var layerIndexes = this._getLayerIndexesByType(layerType);
    if (layerIndexes.length) {
      for (var i = 0; i < subdomains.length; ++i) {
        var subdomain = subdomains[i];
        tiles.push(this._getTileURLTemplate(subdomain, layerIndexes, layerType, pngParams));

        // for mapnik layers add grid json too
        if (layerType === 'mapnik') {
          for (var layerIndex = 0; layerIndex < this.get('metadata').layers.length; ++layerIndex) {
            var mapnikLayerIndex = this._getLayerIndexByType(layerIndex, 'mapnik');
            if (mapnikLayerIndex >= 0) {
              grids[layerIndex] = grids[layerIndex] || [];
              grids[layerIndex].push(this._getGridURLTemplate(subdomain, mapnikLayerIndex, gridParams));
            }
          }
        }
      }
    } else {
      tiles = [EMPTY_GIF];
    }

    return {
      tiles: tiles,
      grids: grids
    };
  },

  /**
   * Generates the URL template for a given tile.
   *
   * EG: http://example.com:8181/api/v1/map/LAYERGROUP_ID/1,2/{z}/{x}/{y}.png?
   */
  _getTileURLTemplate: function (subdomain, layerIndexes, layerType, params) {
    var baseURL = this.getBaseURL(subdomain);
    var tileSchema = '{z}/{x}/{y}';
    var tileExtension = this.TILE_EXTENSIONS_BY_LAYER_TYPE[layerType];
    var urlParams = params ? '?' + params : '';

    return baseURL + '/' + layerIndexes.join(',') + '/' + tileSchema + tileExtension + urlParams;
  },

  /**
   * Generates the URL template for the UTF-8 grid of a given tile and layer.
   *
   * EG: http://example.com:8181/api/v1/map/LAYERGROUP_ID/1/{z}/{x}/{y}.grid.json
   */
  _getGridURLTemplate: function (subdomain, layerIndex, params) {
    var baseURL = this.getBaseURL(subdomain);
    var tileSchema = '{z}/{x}/{y}';
    var urlParams = params ? '?' + params : '';

    return baseURL + '/' + layerIndex + '/' + tileSchema + '.grid.json' + urlParams;
  },

  getLayerMeta: function (layerIndex) {
    var layerMeta = {};
    var metadataLayerIndex = this._localLayerIndexToWindshaftLayerIndex(layerIndex);
    var layers = this.get('metadata') && this.get('metadata').layers;
    if (layers && layers[metadataLayerIndex]) {
      layerMeta = layers[metadataLayerIndex].meta || {};
    }
    return layerMeta;
  },

  _localLayerIndexToWindshaftLayerIndex: function (layerIndex) {
    var layers = this.get('metadata') && this.get('metadata').layers;
    var hasTiledLayer = layers.length > 0 && layers[0].type === 'http';
    return hasTiledLayer ? ++layerIndex : layerIndex;
  },

  _encodeParams: function (params, included) {
    if (!params) return '';
    var url_params = [];
    included = included || _.keys(params);
    for (var i in included) {
      var k = included[i];
      var p = params[k];
      if (p) {
        if (_.isArray(p)) {
          for (var j = 0, len = p.length; j < len; j++) {
            url_params.push(k + '[]=' + encodeURIComponent(p[j]));
          }
        } else {
          var q = encodeURIComponent(p);
          q = q.replace(/%7Bx%7D/g, '{x}').replace(/%7By%7D/g, '{y}').replace(/%7Bz%7D/g, '{z}');
          url_params.push(k + '=' + q);
        }
      }
    }
    return url_params.join('&');
  },

  /**
   * Returns the indexes of the layer of a given type, as the tiler kwows it.
   *
   * @param {string|array} types - Type or types of layers
   */
  _getLayerIndexesByType: function (types) {
    var layers = this.get('metadata') && this.get('metadata').layers;

    if (!layers) {
      return;
    }
    var layerIndexes = [];
    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      var isValidType = false;
      if (types && types.length > 0) {
        isValidType = types.indexOf(layer.type) !== -1;
      }
      if (isValidType) {
        layerIndexes.push(i);
      }
    }
    return layerIndexes;
  },

  /**
   * Returns the index of a layer of a given type, as the tiler kwows it.
   *
   * @param {integer} index - number of layer of the specified type
   * @param {string} layerType - type of the layers
   */
  _getLayerIndexByType: function (index, layerType) {
    var layers = this.get('metadata') && this.get('metadata').layers;

    if (!layers) {
      return index;
    }

    var tilerLayerIndex = {};
    var j = 0;
    for (var i = 0; i < layers.length; i++) {
      if (layers[i].type === layerType) {
        tilerLayerIndex[j] = i;
        j++;
      }
    }
    if (tilerLayerIndex[index] === undefined) {
      return -1;
    }
    return tilerLayerIndex[index];
  }
});

module.exports = WindshaftMap;
