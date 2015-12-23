var $ = require('jquery');
var _ = require('underscore');
var LZMA = require('lzma');
var util = require('../core/util');
var MapInstance = require('./map-instance');

var validatePresenceOfOptions = function (options, requiredOptions) {
  var missingOptions = _.filter(requiredOptions, function (option) {
    return !options[option];
  });
  if (missingOptions.length) {
    throw new Error('WindshaftClient could not be initialized. The following options are missing: ' + missingOptions.join(', '));
  }
};

/**
 * Windshaft client. It provides a method to create instances of maps in Windshaft.
 * @param {object} options Options to set up the client
 */
var WindshaftClient = function (options) {
  validatePresenceOfOptions(options, ['urlTemplate', 'userName', 'endpoint', 'statTag']);

  // TODO: Separate attributes, from related objects in the arguments
  this.urlTemplate = options.urlTemplate;
  this.userName = options.userName;
  this.endpoint = options.endpoint;
  this.statTag = options.statTag;
  this.forceCors = options.forceCors || false;
  this.configGenerator = options.configGenerator;

  this.url = this.urlTemplate.replace('{user}', this.userName);
};

WindshaftClient.DEFAULT_COMPRESSION_LEVEL = 3;
WindshaftClient.MAX_GET_SIZE = 2033;

WindshaftClient.prototype.instantiateMap = function (options) {
  var layers = options.layers;
  var dataviews = options.dataviews;

  var filters = options.filters || {};
  var successCallback = options.success;
  var errorCallback = options.error;

  var mapConfig = this.configGenerator.generate({
    layers: layers,
    dataviews: dataviews
  });

  var payload = JSON.stringify(mapConfig);

  var ajaxOptions = {
    success: function (data) {
      if (data.errors) {
        errorCallback(data.errors[0]);
      } else {
        data.urlTemplate = this.urlTemplate;
        data.userName = this.userName;
        successCallback(new MapInstance(data));
      }
    }.bind(this),
    error: function (xhr) {
      var err = { errors: ['Unknown error'] };
      try {
        err = JSON.parse(xhr.responseText);
      } catch (e) {}
      errorCallback(err.errors[0]);
    }
  };

  // TODO: Move this
  var params = [
    ['stat_tag', this.statTag].join('=')
  ];

  if (Object.keys(filters).length) {
    params.push(['filters', encodeURIComponent(JSON.stringify(filters))].join('='));
  }

  if (this._usePOST(payload, params)) {
    this._post(payload, params, ajaxOptions);
  } else {
    this._get(payload, params, ajaxOptions);
  }
};

WindshaftClient.prototype._usePOST = function (payload, params) {
  if (util.isCORSSupported() && this.forceCors) {
    return true;
  }
  return payload.length >= this.constructor.MAX_GET_SIZE;
};

WindshaftClient.prototype._post = function (payload, params, options) {
  $.ajax({
    crossOrigin: true,
    method: 'POST',
    dataType: 'json',
    contentType: 'application/json',
    url: this._getURL(params),
    data: payload,
    success: options.success,
    error: options.error
  });
};

WindshaftClient.prototype._get = function (payload, params, options) {
  var compressFunction = this._getCompressor(payload);
  compressFunction(payload, this.constructor.DEFAULT_COMPRESSION_LEVEL, function (dataParameter) {
    params.push(dataParameter);
    $.ajax({
      url: this._getURL(params),
      method: 'GET',
      dataType: 'jsonp',
      jsonpCallback: this._jsonpCallbackName(payload),
      cache: true,
      success: options.success,
      error: options.error
    });
  }.bind(this));
};

WindshaftClient.prototype._getCompressor = function (payload) {
  if (payload.length < this.constructor.MAX_GET_SIZE) {
    return function (data, level, callback) {
      callback('config=' + encodeURIComponent(data));
    };
  }

  return function (data, level, callback) {
    data = JSON.stringify({ config: data });
    LZMA.compress(data, level, function (encoded) {
      callback('lzma=' + encodeURIComponent(util.array2hex(encoded)));
    });
  };
};

WindshaftClient.prototype._getURL = function (params) {
  return [this.url, this.endpoint].join('/') + '?' + params.join('&');
};

WindshaftClient.prototype._jsonpCallbackName = function (payload) {
  return '_cdbc_' + util.uniqueCallbackName(payload);
};

module.exports = WindshaftClient;
