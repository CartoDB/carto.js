cdb.windshaft.PublicDashboardConfig = {};

cdb.windshaft.PublicDashboardConfig.generate = function(options) {
  this.layers = options.layers;
  this.widgets = options.widgets;
  var config = {};

  config.layers = this.layers.map(function(layerModel, layerIndex) {
    var layerConfig = {
      // if you send CartoDB as type the api returns CartoDB instead of mapnik layer
      // TODO: file a ticket in maps api
      type: layerModel.get('type').toLowerCase(),
      options: {
        sql: layerModel.get('sql'),
        cartocss: layerModel.get('cartocss'),
        cartocss_version: layerModel.get('cartocss_version'),
        interactivity: layerModel.getInteractiveColumnNames()
      }
    };
    if (layerModel.getInfowindowFieldNames().length) {
      layerConfig.options.attributes = {
        id: "cartodb_id",
        columns: layerModel.getInfowindowFieldNames()
      };
    }

    var widgets = this.widgets.where({ layerId: layerModel.get('id') });
    if (widgets && widgets.length) {
      layerConfig.options.widgets = {};

      widgets.forEach(function(widget) {
        layerConfig.options.widgets[widget.get('id')] = widget.toJSON();
      });
    }

    return layerConfig;
  }, this);

  return config;
};
