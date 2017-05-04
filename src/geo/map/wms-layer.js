var LayerModelBase = require('./layer-model-base');

/**
 * WMS layer support
 */
var WMSLayer = LayerModelBase.extend({
  defaults: {
    type: 'WMS',
    visible: true,
    service: 'WMS',
    request: 'GetMap',
    version: '1.1.1',
    layers: '',
    styles: '',
    format: 'image/jpeg',
    transparent: false
  },

  EQUALITY_ATTRIBUTES: ['urlTemplate', 'layers']
});

module.exports = WMSLayer;
