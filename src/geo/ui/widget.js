var View = require('cdb/core/view');
var WidgetLoaderView = require('./widgets/standard/widget_loader_view');
var WidgetErrorView = require('./widgets/standard/widget_error_view');
var WidgetContentView = require('./widgets/standard/widget_content_view');

/**
 * @classdesc Default widget view:
 *
 * It contains:
 * - view model (viewModel)
 * - data model (dataModel)
 *
 * It will offet to the user:
 * - get current data (getData)
 * - filter the current datasource (filter), each view will let
 * different possibilities.
 * - Sync or unsync widget (sync/unsync), making the proper view
 * listen or not changes from the current datasource.
 *
 * @class
 * @extends View
 */
var Widget = View.extend(/** @lends Widget.prototype */{

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

  initialize: function() {
    this.filter = this.options.filter;
  },

  /**
   * Rendders the widget
   *
   * @return {Widget} Widget reference
   */
  render: function() {
    this._initViews();
    return this;
  },


  /**
   * Initialize the widget views adding loader and error subview and creating
   * the content.
   *
   * @private
   */
  _initViews: function() {
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

    var content = this._createContentView();
    this.$el.append(content.render().el);
    this.addView(content);
  },


  /**
   * Generate and return content view. In this case it will be the standard
   * widget content.
   *
   * @private
   * @return {Widget} Widget with the content.
   */
  _createContentView: function() {
    return new WidgetContentView({
      model: this.model,
      filter: this.filter
    });
  }
});


module.exports = Widget;
