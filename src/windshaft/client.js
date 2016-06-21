var $ = require('jquery');
var _ = require('underscore');
var LZMA = require('lzma');
var util = require('../core/util');
var WindshaftError = require('./error');

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
  validatePresenceOfOptions(options, ['urlTemplate', 'userName', 'endpoint']);

  this.urlTemplate = options.urlTemplate;
  this.userName = options.userName;
  this.endpoint = options.endpoint;
  this.statTag = options.statTag;
  this.forceCors = options.forceCors || false;

  this.url = this.urlTemplate.replace('{user}', this.userName);
};

WindshaftClient.DEFAULT_COMPRESSION_LEVEL = 3;
WindshaftClient.MAX_GET_SIZE = 2033;

WindshaftClient.prototype.instantiateMap = function (options) {
  if (!options.mapDefinition) {
    throw new Error('mapDefinition option is required');
  }

  var mapDefinition = options.mapDefinition;
  var params = options.params || {};
  var successCallback = options.success;
  var errorCallback = options.error;
  var payload = JSON.stringify(mapDefinition);

  var getErrors = function (data) {
    return _.map(data.errors_with_context, function (error) {
      return new WindshaftError(error);
    });
  };

  var hasErrors = function (data) {
    return data.errors_with_context;
  };

  var ajaxOptions = {
    success: function (data) {
      if (hasErrors(data)) {
        errorCallback(getErrors(data));
      } else {
        successCallback(data);
      }
    },
    error: function (xhr) {
      var errors = [ new WindshaftError() ];
      try {
        var parsedResponse = JSON.parse(xhr.responseText);
        errors = getErrors(parsedResponse);
      } catch (e) {}
      errorCallback(errors);
    }
  };

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
  compressFunction(payload, this.constructor.DEFAULT_COMPRESSION_LEVEL, function (dataParam) {
    _.extend(params, dataParam);
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
      callback({ config: encodeURIComponent(data) });
    };
  }

  return function (data, level, callback) {
    data = JSON.stringify({ config: data });
    LZMA.compress(data, level, function (encoded) {
      callback({ lzma: encodeURIComponent(util.array2hex(encoded)) });
    });
  };
};

WindshaftClient.prototype._getURL = function (params) {
  var queryString = _.map(params, function (value, name) {
    if (value instanceof Object) {
      value = encodeURIComponent(JSON.stringify(value));
    }
    return [ name + '=' + value ];
  });

  return [this.url, this.endpoint].join('/') + (queryString ? '?' + queryString.join('&') : '');
};

WindshaftClient.prototype._jsonpCallbackName = function (payload) {
  return '_cdbc_' + util.uniqueCallbackName(payload);
};

module.exports = WindshaftClient;
