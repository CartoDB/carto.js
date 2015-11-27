var View = require('cdb/core/view');
var LayerWidgetsView = require('cdb/geo/ui/widgets/layer_widgets_view');
require('simplebar');

/**
 * @classdesc Container for the widgets, which is place within the
 * visualization {@link Vis} instance.
 *
 * @class geo.ui.widgets.WidgetsView
 * @extends core.View
 * @param {Object} options Options **TODO document this options**
 */
var WidgetsView = View.extend(/** @lends geo.ui.widgets.WidgetsView.prototype */ {

  /**
   * CSS class name.
   * @type {String}
   */
  className: 'Widget-canvas',

  /**
   * Initial attributes. **TODO Where is this used ???**
   * @property {String} attributes.data-simplebar-direction Container orientation `vertical/horizontal`
   */
  attributes: {
    "data-simplebar-direction": "vertical"
  },

  /**
   * Backbone' initialize
   * @private
   */
  initialize: function(options) {
    this.layers = options.layers;
  },


  /**
   * Clear and renders the subviews.
   * @return {WidgetView} This WidgetView instance.
   */
  render: function() {
    this.clearSubViews();
    this.layers.each(this._renderLayerWidgetsView, this);
    this.$el.simplebar();
    return this;
  },

  /**
   * Renders a concrete view.
   *
   * @private
   * @param  {Layer} layer **TODO what is the type???**
   */
  _renderLayerWidgetsView: function(layer) {
    var layerWidgetsView = new LayerWidgetsView({
      widgetViewFactory: this.options.widgetViewFactory,
      model: layer
    });
    this.$el.append(layerWidgetsView.render().el);
    this.addView(layerWidgetsView);
  }
});


module.exports = WidgetsView;
