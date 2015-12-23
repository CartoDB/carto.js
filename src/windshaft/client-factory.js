var Map = require('./map');
var Config = require('./config');
var LayerGroupConfig = require('./layergroup-config');
var NamedMapConfig = require('./namedmap-config');
var Client = require('./client');

module.exports = {
  createClient: function (layerGroup) {
    if (layerGroup.get('type') === 'namedmap') {
      return this._newClientForNamedMap(layerGroup);
    }
    if (layerGroup.get('type') === 'layergroup') {
      return this._newClientForLayergroup(layerGroup);
    }
    throw new Error('unsupported layerGroup type');
  },

  _newClientForLayergroup: function (layerGroup) {
    var userName = layerGroup.get('userName');
    var mapsApiTemplate = layerGroup.get('mapsApiTemplate');
    var statTag = layerGroup.get('statTag');
    var endpoint = Config.MAPS_API_BASE_URL;
    var configGenerator = LayerGroupConfig;

    return new Client({
      endpoint: endpoint,
      urlTemplate: mapsApiTemplate,
      userName: userName,
      statTag: statTag,
      forceCors: true,
      configGenerator: configGenerator
    });
  },

  _newClientForNamedMap: function (layerGroup) {
    var userName = layerGroup.get('userName');
    var mapsApiTemplate = layerGroup.get('mapsApiTemplate');
    var statTag = layerGroup.get('statTag');
    var endpoint = [
      Config.MAPS_API_BASE_URL, 'named', layerGroup.get('namedMapId')
    ].join('/');
    var configGenerator = NamedMapConfig;

    return new Client({
      endpoint: endpoint,
      urlTemplate: mapsApiTemplate,
      userName: userName,
      statTag: statTag,
      forceCors: true,
      configGenerator: configGenerator
    });
  }
};
