var Layers = require('./vis/layers');
var _ = require('underscore');
var cdb = require('cdb');
var config = require('cdb.config');
var Loader = require('../core/loader');

var ModuleLoader = function (vizJSON) {
  this._modulesChecked = false;
  this._vizJSON = vizJSON;
};

ModuleLoader.prototype.loadModules = function (callback) {
  if (this._areModulesLoaded()) {
    callback();
  } else {
    this._loadModules(callback);
  }
};

ModuleLoader.prototype._loadModules = function (callback) {
  var layers = this._vizJSON.layers;
  var modules = Layers.modulesForLayers(layers);

  for (var i = 0; i < modules.length; ++i) {
    Loader.loadModule(modules[i]);
  }

  var self = this;
  var loaded = function loaded () {
    if (self._areModulesLoaded(layers)) {
      config.unbind('moduleLoaded', loaded);
      callback();
    }
  };

  config.bind('moduleLoaded', loaded, this);
  _.defer(loaded);
};

ModuleLoader.prototype._areModulesLoaded = function () {
  var modules = Layers.modulesForLayers(this._vizJSON.layers);
  return _.every(_.map(modules, function (module) {
    return cdb[module] !== undefined;
  }));
};

module.exports = ModuleLoader;
