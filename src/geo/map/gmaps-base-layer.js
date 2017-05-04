var LayerModelBase = require('./layer-model-base');

var GMapsBaseLayer = LayerModelBase.extend({
  defaults: {
    type: 'GMapsBase',
    visible: true,
    baseType: 'gray_roadmap',
    style: null
  },

  OPTIONS: ['roadmap', 'satellite', 'terrain', 'custom'],
  EQUALITY_ATTRIBUTES: ['baseType', 'style']
});

module.exports = GMapsBaseLayer;
