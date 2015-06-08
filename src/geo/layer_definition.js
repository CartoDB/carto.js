function MapBase(options) {
  var self = this;

  this.options = _.defaults(options, {
    ajax: window.$ ? window.$.ajax : reqwest.compat,
    pngParams: ['map_key', 'api_key', 'cache_policy', 'updated_at'],
    gridParams: ['map_key', 'api_key', 'cache_policy', 'updated_at'],
    cors: cdb.core.util.isCORSSupported(),
    MAX_GET_SIZE: 2033,
    force_cors: false,
    instanciateCallback: function() {
      return '_cdbc_' + self._callbackName();
    }
  });

  this.mapProperties = null;
  this.urls = null;
  this.silent = false;
  this.interactionEnabled = []; //TODO: refactor, include inside layer
  this._layerTokenQueue = [];
  this._timeout = -1;
  this._queue = [];
  this._waiting = false;
  this.lastTimeUpdated = null;
  this._refreshTimer = -1;

  // build template url
  if (!this.options.maps_api_template) {
    this._buildMapsApiTemplate(this.options);
  }
}

MapBase.BASE_URL = '/api/v1/map';
MapBase.EMPTY_GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

MapBase.prototype = {

  _buildMapsApiTemplate: function(opts) {
    var tilerProtocol = opts.tiler_protocol;
    var tilerDomain = opts.tiler_domain;
    var tilerPort = (opts.tiler_port != "") ? (":" + opts.tiler_port) : "";
    var username = opts.user_name ? "{user}." : "";
    opts.maps_api_template = [tilerProtocol, "://", username, tilerDomain, tilerPort].join('');
  },

  // TODO: This method is actually creating a map in the server -> Rename to createMap?
  getLayerToken: function(callback) {
    var self = this;
    function _done(data, err) {
      var fn;
      while(fn = self._layerTokenQueue.pop()) {
        fn(data, err);
      }
    }
    clearTimeout(this._timeout);
    this._queue.push(_done);
    this._layerTokenQueue.push(callback);
    this._timeout = setTimeout(function() {
      self._getLayerToken(_done);
    }, 4);
  },

  _getLayerToken: function(callback) {
    var self = this;
    var params = [];
    callback = callback || function() {};

    // if the previous request didn't finish, queue it
    if(this._waiting) {
      return this;
    }

    this._queue = [];

    // when it's a named map the number of layers is not known
    // so fetch the map
    if (!this.named_map && this.visibleLayers().length === 0) {
      callback(null);
      return;
    }

    // setup params
    var extra_params = this.options.extra_params || {};
    var api_key = this.options.map_key || this.options.api_key || extra_params.map_key || extra_params.api_key;
    if(api_key) {
      params.push("map_key=" + api_key);
    }
    if(extra_params.auth_token) {
      if (_.isArray(extra_params.auth_token)) {
        for (var i = 0, len = extra_params.auth_token.length; i < len; i++) {
          params.push("auth_token[]=" + extra_params.auth_token[i]);
        }
      } else {
        params.push("auth_token=" + extra_params.auth_token);
      }
    }

    if (this.stat_tag) {
      params.push("stat_tag=" + this.stat_tag);
    }
    // mark as the request is being done
    this._waiting = true;
    var req = null;
    if (this._usePOST()) {
      req = this._requestPOST;
    } else {
      req = this._requestGET;
    }
    req.call(this, params, callback);
    return this;
  },

  _usePOST: function() {
    if (this.options.cors) {
      if (this.options.force_cors) {
        return true;
      }
      // check payload size
      var payload = JSON.stringify(this.toJSON());
      if (payload.length > this.options.MAX_GET_SIZE) {
        return true;
      }
    }
    return false;
  },

  _requestPOST: function(params, callback) {
    var self = this;
    var ajax = this.options.ajax;

    var loadingTime = cartodb.core.Profiler.metric('cartodb-js.layergroup.post.time').start();

    ajax({
      crossOrigin: true,
      type: 'POST',
      method: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      url: this._tilerHost() + this.endPoint + (params.length ? "?" + params.join('&'): ''),
      data: JSON.stringify(this.toJSON()),
      success: function(data) {
        loadingTime.end();
        // discard previous calls when there is another call waiting
        if(0 === self._queue.length) {
          callback(data);
        }
        self._requestFinished();
      },
      error: function(xhr) {
        loadingTime.end();
        cartodb.core.Profiler.metric('cartodb-js.layergroup.post.error').inc();
        var err = { errors: ['unknow error'] };
        if (xhr.status === 0) {
          err = { errors: ['connection error'] };
        }
        try {
          err = JSON.parse(xhr.responseText);
        } catch(e) {}
        if(0 === self._queue.length) {
          callback(null, err);
        }
        self._requestFinished();
      }
    });
  },

  _requestGET: function(params, callback) {
    var self = this;
    var ajax = this.options.ajax;
    var json = JSON.stringify(this.toJSON());
    var compressor = this._getCompressor(json);
    var endPoint = self.JSONPendPoint || self.endPoint;
    compressor(json, 3, function(encoded) {
      params.push(encoded);
      var loadingTime = cartodb.core.Profiler.metric('cartodb-js.layergroup.get.time').start();
      var host = self.options.dynamic_cdn ? self._host(): self._tilerHost();
      ajax({
        dataType: 'jsonp',
        url: host + endPoint + '?' + params.join('&'),
        jsonpCallback: self.options.instanciateCallback,
        cache: !!self.options.instanciateCallback,
        success: function(data) {
          loadingTime.end();
          if(0 === self._queue.length) {
            // check for errors
            if (data.errors) {
              cartodb.core.Profiler.metric('cartodb-js.layergroup.get.error').inc();
              callback(null, data);
            } else {
              callback(data);
            }
          }
          self._requestFinished();
        },
        error: function(data) {
          loadingTime.end();
          cartodb.core.Profiler.metric('cartodb-js.layergroup.get.error').inc();
          var err = { errors: ['unknow error'] };
          try {
            err = JSON.parse(xhr.responseText);
          } catch(e) {}
          if(0 === self._queue.length) {
            callback(null, err);
          }
          self._requestFinished();
        }
      });
    });
  },

  // returns the compressor depending on the size
  // of the layer
  _getCompressor: function(payload) {
    var self = this;
    if (this.options.compressor) {
      return this.options.compressor;
    }

    payload = payload || JSON.stringify(this.toJSON());
    if (!this.options.force_compress && payload.length < this.options.MAX_GET_SIZE) {
      return function(data, level, callback) {
        callback("config=" + encodeURIComponent(data));
      };
    }

    return function(data, level, callback) {
      data = JSON.stringify({ config: data });
      LZMA.compress(data, level, function(encoded) {
        callback("lzma=" + encodeURIComponent(cdb.core.util.array2hex(encoded)));
      });
    };

  },

  _requestFinished: function() {
    var self = this;
    this._waiting = false;
    this.lastTimeUpdated = new Date().getTime();

    // refresh layer when invalidation time has passed
    clearTimeout(this._refreshTimer);
    this._refreshTimer = setTimeout(function() {
      self.invalidate();
    }, this.options.refreshTime || (60*120*1000)); // default layergroup ttl

    // check request queue
    if(this._queue.length) {
      var last = this._queue[this._queue.length - 1];
      this._getLayerToken(last);
    }
  },

  // for named maps, attributes are fetched from the attributes service
  fetchAttributes: function(layer_index, feature_id, columnNames, callback) {
    this._attrCallbackName = this._attrCallbackName || this._callbackName();
    var ajax = this.options.ajax;
    var loadingTime = cartodb.core.Profiler.metric('cartodb-js.named_map.attributes.time').start();
    ajax({
      dataType: 'jsonp',
      url: this._attributesUrl(layer_index, feature_id),
      jsonpCallback: '_cdbi_layer_attributes_' + this._attrCallbackName,
      cache: true,
      success: function(data) {
        loadingTime.end();
        callback(data);
      },
      error: function(data) {
        loadingTime.end();
        cartodb.core.Profiler.metric('cartodb-js.named_map.attributes.error').inc();
        callback(null);
      }
    });
  },

  _callbackName: function() {
    return cdb.core.util.uniqueCallbackName(JSON.stringify(this.toJSON()));
  },

  invalidate: function() {
    this.mapProperties = null;
    this.urls = null;
    this.onLayerDefinitionUpdated();
  },

  getTiles: function(callback) {
    var self = this;
    if(self.mapProperties) {
      callback && callback(self._layerGroupTiles());
      return this;
    }
    this.getLayerToken(function(data, err) {
      if(data) {
        self.mapProperties = data;

        // if cdn_url is present, use it
        if (data.cdn_url) {
          var c = self.options.cdn_url = self.options.cdn_url || {};
          c.http = data.cdn_url.http || c.http;
          c.https = data.cdn_url.https || c.https;
        }
        self.urls = self._layerGroupTiles();
        callback && callback(self.urls);
      } else {
        if ((self.named_map !== null) && (err) ){
          callback && callback(null, err);
        } else if (self.visibleLayers().length === 0) {
          callback && callback({
            tiles: [MapBase.EMPTY_GIF],
            grids: []
          });
          return;
        } 
      }
    });
    return this;
  },

  isHttps: function() {
    return this.options.maps_api_template.indexOf('https') === 0;
  },

  _layerGroupTiles: function() {
    var grids = [];
    var tiles = [];
    var pngParams = this._encodeParams(this.options.extra_params, this.options.pngParams);
    var gridParams = this._encodeParams(this.options.extra_params, this.options.gridParams);
    var subdomains = this.options.subdomains || ['0', '1', '2', '3'];
    if(this.isHttps()) {
      subdomains = [null]; // no subdomain
    }
    var filter = this.options.filter;
    var layerGroupId = this.mapProperties.layergroupid;
    var layers = this.mapProperties.metadata.layers;

    // Iterate through the layers returned by the tiler as metadata and
    // extract the indexes of all the layers that should be rendered
    var layerIndexes = [];
    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      var isValidType = layer.type !== 'torque';
      if (filter) {
        isValidType = isValidType && filter.indexOf(layer.type) != -1
      }
      if (isValidType) {
        layerIndexes.push(i);
      }
    }

    if (layerIndexes.length) {
      var tileTemplate = '/' +  layerIndexes.join(',') +'/{z}/{x}/{y}';
      var gridTemplate = '/{z}/{x}/{y}';

      for(var i = 0; i < subdomains.length; ++i) {
        var s = subdomains[i]
        var cartodb_url = this._host(s) + MapBase.BASE_URL + '/' + layerGroupId
        tiles.push(cartodb_url + tileTemplate + ".png" + (pngParams ? "?" + pngParams: '') );

        for(var layer = 0; layer < this.layers.length; ++layer) {
          grids[layer] = grids[layer] || [];
          grids[layer].push(cartodb_url + "/" + layer +  gridTemplate + ".grid.json" + (gridParams ? "?" + gridParams: ''));
        }
      }
    } else {
      tiles = [MapBase.EMPTY_GIF];
    }

    return {
      tiles: tiles,
      grids: grids
    }
  },

  /**
   * Change query of the tiles
   * @params {str} New sql for the tiles
   */
  _encodeParams: function(params, included) {
    if(!params) return '';
    var url_params = [];
    included = included || _.keys(params);
    for(var i in included) {
      var k = included[i]
      var p = params[k];
      if(p) {
        if (_.isArray(p)) {
          for (var j = 0, len = p.length; j < len; j++) {
            url_params.push(k + "[]=" + encodeURIComponent(p[j]));
          }
        } else {
          var q = encodeURIComponent(p);
          q = q.replace(/%7Bx%7D/g,"{x}").replace(/%7By%7D/g,"{y}").replace(/%7Bz%7D/g,"{z}");
          url_params.push(k + "=" + q);
        }
      }
    }
    return url_params.join('&')
  },

  onLayerDefinitionUpdated: function() {},

  setSilent: function(b) {
    this.silent = b;
  },

  _definitionUpdated: function() {
    if(this.silent) return;
    this.invalidate();
  },

  /**
   * get tile json for layer
   */
  getTileJSON: function(layer, callback) {
    layer = layer == undefined ? 0: layer;
    var self = this;
    this.getTiles(function(urls) {
      if(!urls) {
        callback(null);
        return;
      }
      if(callback) {
        callback(self._tileJSONfromTiles(layer, urls));
      }
    });
  },

  _tileJSONfromTiles: function(layer, urls, options) {
    options = options || {};
    var subdomains = options.subdomains || ['0', '1', '2', '3'];

    function replaceSubdomain(t) {
      var tiles = [];
      for (var i = 0; i < t.length; ++i) {
        tiles.push(t[i].replace('{s}', subdomains[i % subdomains.length]));
      }
      return tiles;
    }

    return {
      tilejson: '2.0.0',
      scheme: 'xyz',
      grids: replaceSubdomain(urls.grids[layer]),
      tiles: replaceSubdomain(urls.tiles),
      formatter: function(options, data) { return data; }
     };
  },

  _tilerHost: function() {
    var opts = this.options;
    return opts.maps_api_template.replace('{user}', opts.user_name);
  },

  _host: function(subhost) {
    var opts = this.options;
    var cdn_host = opts.cdn_url;
    var has_empty_cdn = !cdn_host || (cdn_host && (!cdn_host.http && !cdn_host.https));

    if (opts.no_cdn || has_empty_cdn) {
      return this._tilerHost();
    } else {
      var protocol = this.isHttps() ? 'https': 'http';
      var h = protocol + "://";
      if (subhost) {
        h += subhost + ".";
      }

      var cdn_url = cdn_host[protocol];
      // build default template url if the cdn url is not templatized
      // this is for backwards compatiblity, ideally we should use the url
      // that tiler sends to us right away
      if (!this._isUserTemplateUrl(cdn_url)) {
        cdn_url = cdn_url  + "/{user}";
      }
      h += cdn_url.replace('{user}', opts.user_name)

      return h;
    }
  },

  _isUserTemplateUrl: function(t) {
    return t && t.indexOf('{user}') !== -1;
  },

  // Methods to operate with layers
  getLayer: function(index) {
    return _.clone(this.layers[index]);
  },

  getLayerCount: function() {
    return this.layers ? this.layers.length: 0;
  },

  // given number inside layergroup 
  // returns the real index in tiler layergroup`
  getLayerIndexByNumber: function(number) {
    var layers = {}
    var c = 0;
    for(var i = 0; i < this.layers.length; ++i) {
      var layer = this.layers[i];
      layers[i] = c;
      if(layer.options && !layer.options.hidden) {
        ++c;
      }
    }
    return layers[number];
  },

  /**
   * return the layer number by index taking into
   * account the hidden layers.
   */
  getLayerNumberByIndex: function(index) {
    var layers = [];
    for(var i = 0; i < this.layers.length; ++i) {
      var layer = this.layers[i];
      if(layer.options && !layer.options.hidden) {
        layers.push(i);
      }
    }
    if (index >= layers.length) {
      return -1;
    }
    return +layers[index];
  },

  visibleLayers: function() {
    var layers = [];
    for(var i = 0; i < this.layers.length; ++i) {
      var layer = this.layers[i];
      if(layer.options && !layer.options.hidden) {
        layers.push(layer);
      }
    }
    return layers;
  },

  setLayer: function(layer, def) {
    if(layer < this.getLayerCount() && layer >= 0) {
      if (def.options.hidden) {
        var i = this.interactionEnabled[layer];
        if (i) {
          def.interaction = true
          this.setInteraction(layer, false);
        }
      } else {
        if (this.layers[layer].interaction) {
          this.setInteraction(layer, true);
          delete this.layers[layer].interaction;
        }
      }
      this.layers[layer] = _.clone(def);
    }
    this.invalidate();
    return this;
  },

  getTooltipData: function(layer) {
    return this.layers[layer].tooltip;
  },

  getInfowindowData: function(layer) {
    var lyr;
    var infowindow = this.layers[layer].infowindow;
    if (!infowindow && this.options.layer_definition && (lyr = this.options.layer_definition.layers[layer])) {
      infowindow = lyr.infowindow;
    }
    if (infowindow && infowindow.fields && infowindow.fields.length > 0) {
      return infowindow;
    }
    return null;
  },

  containInfowindow: function() {
    var layers =  this.options.layer_definition.layers;
    for(var i = 0; i < layers.length; ++i) {
      var infowindow = layers[i].infowindow;
      if (infowindow && infowindow.fields && infowindow.fields.length > 0) {
        return true;
      }
    }
    return false;
  },

  containTooltip: function() {
    var layers =  this.options.layer_definition.layers;
    for(var i = 0; i < layers.length; ++i) {
      var tooltip = layers[i].tooltip;
      if (tooltip && tooltip.fields && tooltip.fields.length) {
        return true;
      }
    }
    return false;
  },

  getSubLayer: function(index) {
    var layer = this.layers[index];
    layer.sub = layer.sub || SubLayerFactory.createSublayer(layer.type, this, index);
    return layer.sub;
  },

  getSubLayerCount: function() {
    return this.getLayerCount();
  },

  getSubLayers: function() {
    var layers = []
    for (var i = 0; i < this.getSubLayerCount(); ++i) {
      layers.push(this.getSubLayer(i))
    }
    return layers;
  }
};

// TODO: This is actually an AnonymousMap -> Rename?
function LayerDefinition(layerDefinition, options) {
  MapBase.call(this, options);
  this.endPoint = MapBase.BASE_URL;
  this.setLayerDefinition(layerDefinition, { silent: true });
}

/**
 * Generates the MapConfig definition for a list of sublayers.
 *
 * ``sublayers`` should be an array, an exception is thrown otherwise.
 *
 */
LayerDefinition.layerDefFromSubLayers = function(sublayers) {

  if(!sublayers || sublayers.length === undefined) throw new Error("sublayers should be an array");

  sublayers = _.map(sublayers, function(sublayer) {
    var type = sublayer.type;
    delete sublayer.type;
    return {
      type: type,
      options: sublayer
    }
  });

  var layerDefinition = {
    version: '1.3.0',
    stat_tag: 'API',
    layers: sublayers
  }

  return new LayerDefinition(layerDefinition, {}).toJSON();
};

LayerDefinition.prototype = _.extend({}, MapBase.prototype, {

  setLayerDefinition: function(layerDefinition, options) {
    options = options || {};
    this.version = layerDefinition.version || '1.0.0';
    this.stat_tag = layerDefinition.stat_tag;
    this.layers = _.clone(layerDefinition.layers);
    if(!options.silent) {
      this._definitionUpdated();
    }
  },

  toJSON: function() {
    var obj = {};
    obj.version = this.version;
    if(this.stat_tag) {
      obj.stat_tag = this.stat_tag;
    }
    obj.layers = [];
    var layers = this.visibleLayers();
    for(var i = 0; i < layers.length; ++i) {
      var sublayer = this.getSubLayer(this.getLayerNumberByIndex(i));
      obj.layers.push(sublayer.toJSON());
    }
    return obj;
  },

  removeLayer: function(layer) {
    if(layer < this.getLayerCount() && layer >= 0) {
      this.layers.splice(layer, 1);
      this.interactionEnabled.splice(layer, 1);
      this._reorderSubLayers();
      this.invalidate();
    }
    return this;
  },

  _reorderSubLayers: function() {
    for(var i = 0; i < this.layers.length; ++i) {
      var layer = this.layers[i];
      if(layer.sub) {
        layer.sub._setPosition(i);
      }
    }
  },

  addLayer: function(def, index) {
    index = index === undefined ? this.getLayerCount(): index;
    if(index <= this.getLayerCount() && index >= 0) {

      var type = def.type || 'cartodb';
      delete def.type;

      this.layers.splice(index, 0, {
        type: type,
        options: def
      });

      var sublayer = this.getSubLayer(index);
      if (sublayer.isValid()) {
        this._definitionUpdated();
      } else { // Remove it from the definition
        sublayer.remove();
        throw 'Layer definition should contain all the required attributes';
      }
    }
    return this;
  },

  /**
   * set interactivity attributes for a layer.
   * if attributes are passed as first param layer 0 is
   * set
   */
  setInteractivity: function(layer, attributes) {
    if(attributes === undefined) {
      attributes = layer;
      layer = 0;
    }

    if(layer >= this.getLayerCount() && layer < 0) {
      throw new Error("layer does not exist");
    }

    if(typeof(attributes) == 'string') {
      attributes = attributes.split(',');
    }

    for(var i = 0; i < attributes.length; ++i) {
      attributes[i] = attributes[i].replace(/ /g, '');
    }

    this.layers[layer].options.interactivity = attributes;
    this._definitionUpdated();
    return this;
  },

  setQuery: function(layer, sql) {
    if(sql === undefined) {
      sql = layer;
      layer = 0;
    }
    this.layers[layer].options.sql = sql
    this._definitionUpdated();
  },

  getQuery: function(layer) {
    layer = layer || 0;
    return this.layers[layer].options.sql
  },

  /**
   * Change style of the tiles
   * @params {style} New carto for the tiles
   */
  setCartoCSS: function(layer, style, version) {
    if(version === undefined) {
      version = style;
      style = layer;
      layer = 0;
    }

    version = version || cartodb.CARTOCSS_DEFAULT_VERSION;

    this.layers[layer].options.cartocss = style;
    this.layers[layer].options.cartocss_version = version;
    this._definitionUpdated();
  },

  /**
   * adds a new sublayer to the layer with the sql and cartocss params
   */
  createSubLayer: function(attrs, options) {
    this.addLayer(attrs);
    return this.getSubLayer(this.getLayerCount() - 1);
  },

  _attributesUrl: function(layer, feature_id) {
    // /api/maps/:map_id/:layer_index/attributes/:feature_id
    var host = this._host();
    var url = [
      host,
      //'api',
      //'v1',
      MapBase.BASE_URL.slice(1),
      this.mapProperties.layergroupid,
      this.getLayerIndexByNumber(layer),
      'attributes',
      feature_id].join('/');

    return url;
  }
});

function NamedMap(named_map, options) {
  MapBase.call(this, options);
  this.options.pngParams.push('auth_token')
  this.options.gridParams.push('auth_token')
  this.setLayerDefinition(named_map, options)
  this.stat_tag = named_map.stat_tag;
}

NamedMap.prototype = _.extend({}, MapBase.prototype, {

  getSubLayer: function(index) {
    var layer = this.layers[index];
    // for named maps we don't know how many layers are defined so
    // we create the layer on the fly
    if (!layer) {
      layer = this.layers[index] = {
        options: {}
      };
    }
    layer.sub = layer.sub || SubLayerFactory.createSublayer(layer.type, this, index);
    return layer.sub;
  },

  setLayerDefinition: function(named_map, options) {
    options = options || {}
    this.endPoint = MapBase.BASE_URL + '/named/' + named_map.name;
    this.JSONPendPoint = MapBase.BASE_URL + '/named/' + named_map.name + '/jsonp';
    this.layers = _.clone(named_map.layers) || [];
    for(var i = 0; i < this.layers.length; ++i) {
      var layer = this.layers[i];
      layer.options = layer.options || { hidden: false };
      layer.options.layer_name = layer.layer_name;
    }
    this.named_map = named_map;
    var token = named_map.auth_token || options.auth_token;
    if (token) {
      this.setAuthToken(token);
    }
    if(!options.silent) {
      this.invalidate();
    }
  },

  setAuthToken: function(token) {
    if(!this.isHttps()) {
      throw new Error("https must be used when map has token authentication");
    }
    this.options.extra_params = this.options.extra_params || {};
    this.options.extra_params.auth_token = token;
    this.invalidate();
    return this;
  },

  setParams: function(attr, v) {
    var params;
    if (arguments.length === 2) {
      params = {}
      params[attr] = v;
    } else {
      params = attr;
    }
    if (!this.named_map.params) {
      this.named_map.params = {};
    }
    for (var k in params) {
      if (params[k] === undefined || params[k] === null) {
        delete this.named_map.params[k];
      } else {
        this.named_map.params[k] = params[k];
      }
    }
    this.invalidate();
    return this;
  },

  toJSON: function() {
    var p = this.named_map.params || {};
    for(var i = 0; i < this.layers.length; ++i) {
      var layer = this.layers[i];
      p['layer' + i] = layer.options.hidden ? 0: 1;
    }
    return p;
  },

  containInfowindow: function() {
    var layers = this.layers || [];
    for(var i = 0; i < layers.length; ++i) {
      var infowindow = layers[i].infowindow;
      if (infowindow && infowindow.fields && infowindow.fields.length > 0) {
        return true;
      }
    }
    return false;
  },

  containTooltip: function() {
    var layers = this.layers || [];
    for(var i = 0; i < layers.length; ++i) {
      var tooltip = layers[i].tooltip;
      if (tooltip) {
        return true;
      }
    }
    return false;
  },

  _attributesUrl: function(layer, feature_id) {
    // /api/maps/:map_id/:layer_index/attributes/:feature_id
    var host = this._host();
    var url = [
      host,
      //'api',
      //'v1',
      MapBase.BASE_URL.slice(1),
      this.mapProperties.layergroupid,
      layer,
      'attributes',
      feature_id].join('/');

    var extra_params = this.options.extra_params || {};
    var token = extra_params.auth_token;
    if (token) {
      if (_.isArray(token)) {
        var tokenParams = [];
        for (var i = 0, len = token.length; i < len; i++) {
          tokenParams.push("auth_token[]=" + token[i]);
        }
        url += "?" + tokenParams.join('&')
      } else {
        url += "?auth_token=" + token
      }
    }
    return url;
  },


  setSQL: function(sql) {
    throw new Error("SQL is read-only in NamedMaps");
  },

  setCartoCSS: function(sql) {
    throw new Error("cartocss is read-only in NamedMaps");
  },

  getCartoCSS: function() {
    throw new Error("cartocss can't be accessed in NamedMaps");
  },

  getSQL: function() {
    throw new Error("SQL can't be accessed in NamedMaps");
  },

  setLayer: function(layer, def) {
    var not_allowed_attrs = {'sql': 1, 'cartocss': 1, 'interactivity': 1 };

    for(var k in def.options) {
      if (k in not_allowed_attrs) {
        delete def.options[k];
        throw new Error( k + " is read-only in NamedMaps");
      }
    }
    return MapBase.prototype.setLayer.call(this, layer, def);
  },

  removeLayer: function(layer) {
    throw new Error("sublayers are read-only in Named Maps");
  },

  createSubLayer: function(attrs, options) {
    throw new Error("sublayers are read-only in Named Maps");
  },

  addLayer: function(def, layer) {
    throw new Error("sublayers are read-only in Named Maps");
  },

  // for named maps the layers are always the same (i.e they are
  // not removed to hide) so the number does not change
  getLayerIndexByNumber: function(number) {
    return +number;
  }
});

