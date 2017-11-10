var _ = require('underscore');
var AnalysisPoller = require('./analysis/analysis-poller');
var AnonymousMapSerializer = require('./windshaft/map-serializer/anonymous-map-serializer/anonymous-map-serializer');
var Backbone = require('backbone');
var CartoDBLayerGroup = require('./geo/cartodb-layer-group');
var DataviewsCollection = require('./dataviews/dataviews-collection');
var LayersCollection = require('./geo/map/layers');
var ModelUpdater = require('./windshaft-integration/model-updater');
var NamedMapSerializer = require('./windshaft/map-serializer/named-map-serializer/named-map-serializer');
var Request = require('./windshaft/request');
var Response = require('./windshaft/response');
var WindshaftClient = require('./windshaft/client');
var AnalysisService = require('./analysis/analysis-service');
var parseWindshaftErrors = require('./windshaft/error-parser');
var log = require('./cdb.log');
var WindshaftError = require('./windshaft/error');

/**
 *
 * Creates a new Engine.
 * An engine is the core of a carto app.
 *
 * With the help of external services the engine will:
 *
 *  - Keep the state of the layers and dataviews.
 *  - Serialize the state and send requests to the server.
 *  - Parse the server response and update the internal models.
 *  - Notify errors or successful operations.
 *
 * @param {Object} params - The parameters to initialize the engine.
 * @param {string} params.apiKey - Api key used to be autenticate in the windshaft server.
 * @param {string} params.authToken - Token used to be autenticate in the windshaft server.
 * @param {string} params.username - Name of the user registered in the windshaft server.
 * @param {string} params.serverUrl - Url of the windshaft server.
 * @param {boolean} params.templateName - While we dont remove named maps we must explicitly say when the map is named. Defaults to false.
 * @param {boolean} params.statTag - Token used to get map view statistics.
 * @class
 * @api
 */
function Engine (params) {
  if (!params) throw new Error('new Engine() called with no paramters');
  this._isNamedMap = params.templateName !== undefined;

  this._windshaftSettings = {
    urlTemplate: params.serverUrl,
    userName: params.username,
    statTag: params.statTag,
    apiKey: params.apiKey,
    authToken: params.authToken,
    templateName: params.templateName
  };

  this._windshaftClient = new WindshaftClient(this._windshaftSettings);

  // This object will be responsible of triggering the engine events.
  this._eventEmmitter = _.extend({}, Backbone.Events);

  this._analysisPoller = new AnalysisPoller();
  this._layersCollection = new LayersCollection();
  this._dataviewsCollection = new DataviewsCollection();

  this._cartoLayerGroup = new CartoDBLayerGroup(
    { apiKey: params.apiKey, authToken: params.authToken },
    { layersCollection: this._layersCollection }
  );

  this._modelUpdater = new ModelUpdater({
    dataviewsCollection: this._dataviewsCollection,
    layerGroupModel: this._cartoLayerGroup,
    layersCollection: this._layersCollection
  });
}

/**
 * Return the cartoLayergroup attached to the engine
 */
Engine.prototype.getLayerGroup = function () {
  return this._cartoLayerGroup;
};

/**
 * Bind a callback function to an event. The callback will be invoked whenever the event is fired.
 *
 * @param {string} event - The name of the event that triggers the callback execution.
 * @param {function} callback - A function to be executed when the event is fired.
 * @param {function} [context] - The context value for this when the callback is invoked.
 *
 * @example
 *
 * // Define a callback to be executed once the map is reloaded.
 * function onReload(event) {
 *  console.log(event); // "reload-success"
 * }
 *
 * // Attach the callback to the RELOAD_SUCCESS event.
 * engine.on(Engine.Events.RELOAD_SUCCESS, onReload);
 *
 * // Call the reload method and wait.
 * engine.reload();
 *
 * @api
 */
Engine.prototype.on = function (event, callback, context) {
  this._eventEmmitter.on(event, callback, context);
};

/**
 * Remove a previously-bound callback function from an event.
 *
 * @param {string} event - The name of the event that triggers the callback execution.
 * @param {function} callback - A function callback to be removed when the event is fired.
 * @param {function} [context] - The context value for this when the callback is invoked.
 *
 * @example
 *
 * // Remove the the `displayMap` listener function so it wont be executed anymore when the engine fires the `load` event.
 * engine.off(Engine.Events.RELOAD_SUCCESS, onReload);
 *
 * @api
 */
Engine.prototype.off = function (event, callback, context) {
  this._eventEmmitter.off(event, callback, context);
};

/**
 * This is the most important function of the engine.
 * Generate a payload from the current state, send it to the windshaft server
 * and update the internal models with the server response.
 *
 * Once the response has arrived trigger a 'reload-succes' or 'reload-error' event.
 *
 * @param {string} options.sourceId - The sourceId triggering the reload event. This is usefull to prevent uneeded requests and save data.
 * @param {boolean} options.forceFetch - Forces dataviews to fetch data from server after a reload
 * @param {boolean} options.includeFilters - Boolean flag to control if the filters need to be added in the payload.
 *
 * @fires Engine#Engine:RELOAD_STARTED
 * @fires Engine#Engine:RELOAD_SUCCESS
 * @fires Engine#Engine:RELOAD_ERROR
 *
 * @api
 */
Engine.prototype.reload = function (options) {
  options = this._buildOptions(options);
  try {
    var params = this._buildParams(options.includeFilters);
    var payload = this._getSerializer().serialize(this._layersCollection, this._dataviewsCollection);
    var request = new Request(payload, params, options);

    this._eventEmmitter.trigger(Engine.Events.RELOAD_STARTED);
    this._windshaftClient.instantiateMap(request);
  } catch (error) {
    this._manageClientError(error, options);
  }
};

/**
 *
 * Add a layer to the engine layersCollection
 *
 * @param {layer} layer - A new layer to be added to the engine.
 *
 * @public
 * @api
 */
Engine.prototype.addLayer = function (layer) {
  this._layersCollection.add(layer);
};

/**
 *
 * Remove a layer from the engine layersCollection
 *
 * @param {layer} layer - A new layer to be removed from the engine.
 *
 * @public
 * @api
 */
Engine.prototype.removeLayer = function (layer) {
  this._layersCollection.remove(layer);
};

/**
 *
 * Add a dataview to the engine dataviewsCollection
 *
 * @param {Dataview} dataview - A new dataview to be added to the engine.
 *
 * @public
 * @api
 */
Engine.prototype.addDataview = function (dataview) {
  this._dataviewsCollection.add(dataview);
};

/**
 *
 * Remove a dataview from the engine dataviewsCollection
 *
 * @param {Dataview} dataview - The Dataview to be removed to the engine.
 *
 * @public
 * @api
 */
Engine.prototype.removeDataview = function (dataview) {
  this._dataviewsCollection.remove(dataview);
};

/**
 * Callback executed when the windhsaft client returns a successful response.
 * Update internal models and trigger a reload_sucess event.
 * @private
 */
Engine.prototype._onReloadSuccess = function (serverResponse, options) {
  var responseWrapper = new Response(this._windshaftSettings, serverResponse);
  this._modelUpdater.updateModels(responseWrapper, options.sourceId, options.forceFetch, options.reason, options.origin, options.originId);
  this._restartAnalysisPolling();
  this._eventEmmitter.trigger(Engine.Events.RELOAD_SUCCESS);
  options.success && options.success();
};

/**
 * Callback executed when the windhsaft client returns a failed response.
 * Update internal models setting errores and trigger a reload_error event.
 * @private
 */
Engine.prototype._onReloadError = function (serverResponse, options) {
  var windshaftErrors = parseWindshaftErrors(serverResponse);
  var error = _.find(windshaftErrors, function (error) { return error.isGlobalError(); });
  this._modelUpdater.setErrors(windshaftErrors);
  this._eventEmmitter.trigger(Engine.Events.RELOAD_ERROR, error);
  options.error && options.error();
};

/**
 * Helper to get windhsaft request options.
 * @private
 */
Engine.prototype._buildOptions = function (options) {
  options = options || {};
  return _.extend({
    includeFilters: true,
    success: function (serverResponse) {
      this._onReloadSuccess(serverResponse, options);
    }.bind(this),
    error: function (serverResponse) {
      this._onReloadError(serverResponse, options);
    }.bind(this)
  }, _.pick(options, 'sourceId', 'forceFetch', 'includeFilters', 'reason', 'origin', 'originId'));
};

/**
 * Helper to get windhsaft request parameters.
 * @param {boolean} includeFilters - Boolean flag to control if the filters need to be added in the payload.
 * @private
 */
Engine.prototype._buildParams = function (includeFilters) {
  var params = {
    stat_tag: this._windshaftSettings.statTag
  };
  if (includeFilters && !_.isEmpty(this._dataviewsCollection.getFilters())) {
    params.filters = this._dataviewsCollection.getFilters();
  }
  if (this._windshaftSettings.apiKey) {
    params.api_key = this._windshaftSettings.apiKey;
    return params;
  }
  if (this._windshaftSettings.authToken) {
    params.auth_token = this._windshaftSettings.authToken;
    return params;
  }
  console.error('Engine initialized with no apiKeys neither authToken');
};

/**
 * Reset the analysis nodes in the poller
 * @private
 */
Engine.prototype._restartAnalysisPolling = function () {
  var analysisNodes = AnalysisService.getUniqueAnalysisNodes(this._layersCollection, this._dataviewsCollection);
  this._analysisPoller.resetAnalysisNodes(analysisNodes);
};

/**
 * Get the instance of the serializer service depending on is an anonymous or a named map.
 * @private
 */
Engine.prototype._getSerializer = function () {
  return this._isNamedMap ? NamedMapSerializer : AnonymousMapSerializer;
};

/**
 * Manage and propagate the client error
 * @private
 */
Engine.prototype._manageClientError = function (error, options) {
  var windshaftError = new WindshaftError({
    message: error.message
  });
  this._modelUpdater.setErrors([windshaftError]);

  log.error(error.message);
  options.error && options.error();
};

/**
 * Events fired by the engine
 *
 * @readonly
 * @enum {string}
 * @api
 */
Engine.Events = {
  /**
   * Reload started event, fired every time the reload process starts.
   */
  RELOAD_STARTED: 'reload-started',
  /**
   * Reload success event, fired every time the reload function succeed.
   */
  RELOAD_SUCCESS: 'reload-success',
  /**
   * Reload success event, fired every time the reload function fails.
   */
  RELOAD_ERROR: 'reload-error'
};

module.exports = Engine;

/**
 * Reload started event, fired every time the reload process starts.
 *
 * @event Engine#Engine:RELOAD_STARTED
 * @type {string}
 * @api
 */

/**
  * Reload success event, fired every time the reload function succeed.
  *
  * @event Engine#Engine:RELOAD_SUCCESS
  * @type {string}
  * @api
  */

/**
  * Reload success event, fired every time the reload function fails.
  *
  * @event Engine#Engine:RELOAD_ERROR
  * @type {string}
  * @api
  */
