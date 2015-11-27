var View = require('cdb/core/view');
var WidgetLoaderView = require('./standard/widget_loader_view');
var WidgetErrorView = require('./standard/widget_error_view');

/**
 * @classdesc Default widget view:
 *
 * It contains:
 * - view model (viewModel)
 * - data model (dataModel)
 *
 *  It will offet to the user:
 *  - get current data (getData)
 *  - Sync or unsync widget (sync/unsync), making the proper view
 *  listen or not changes from the current datasource.
 *
 * @class geo.ui.widgets.WidgetView
 * @extends core.View
 */
var Widget = View.extend(/** @lends geo.ui.widgets.WidgetView.prototype */ {

  /**
   * CSS class name
   * @type {String}
   */
  className: 'Widget Widget--light',

  /**
   * Default widget options
   * @property {Array} columns_title **TODO document**
   * @property {bool} sync  True makes the view listening for changes on the datasource.
   */
  options: {
    columns_title: [],
    sync: true
  },

  /**
   * Render's the current widget. This method must be called by subclasses.
   * @return {geo.ui.widgets.WidgetView} This instance.
   */
  render: function() {
    this._loader = new WidgetLoaderView({
      model: this.model
    });
    this.$el.append(this._loader.render().el);
    this.addView(this._loader);

    this._error = new WidgetErrorView({
      model: this.model
    });
    this._error.bind('refreshData', function() {
      console.log("refresh data man!");
    }, this);
    this.$el.append(this._error.render().el);
    this.addView(this._error);

    var contentView = this.options.contentView;
    this.$el.append(contentView.render().el);
    this.addView(contentView);

    return this;
  }
});


module.exports = Widget;
