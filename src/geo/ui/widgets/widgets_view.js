var View = require('cdb/core/view');
var LayerWidgetsView = require('cdb/geo/ui/widgets/layer_widgets_view');
require('simplebar');


var WidgetsView = View.extend(/** @lends WidgetsView.prototype */ {

  className: 'Widget-canvas',
  attributes: {
    "data-simplebar-direction": "vertical"
  },

  /**
   * Create a new container view instance.
   *
   * @classdesc Container view for the widgets.
   *
   * @constructs
   * @extends View
   * @param {Object} options Options **TODO document this options**
   */
  initialize: function(options) {
    this.layers = options.layers;
  },

  render: function() {
    this.clearSubViews();
    this.layers.each(this._renderLayerWidgetsView, this);
    this.$el.simplebar();
    return this;
  },

  _renderLayerWidgetsView: function(layer) {
    var layerWidgetsView = new LayerWidgetsView({ model: layer });
    this.$el.append(layerWidgetsView.render().el);
    this.addView(layerWidgetsView);
  }
});


module.exports = WidgetsView;
