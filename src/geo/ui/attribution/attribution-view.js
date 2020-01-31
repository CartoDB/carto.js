var $ = require('jquery');
var _ = require('underscore');
var View = require('../../../core/view');
var Model = require('../../../core/model');
var template = require('./attribution-template.tpl');
var Sanitize = require('../../../core/sanitize');

/**
 *  Attribution overlay
 *
 */

module.exports = View.extend({
  className: 'CDB-Attribution',

  events: {
    'click .js-button': '_toggleAttributions',
    'dblclick': 'killEvent'
  },

  initialize: function () {
    this.model = new Model({
      visible: false
    });
    this.map = this.options.map;

    this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
    this._toggleAttributionsBasedOnContainer = this._toggleAttributionsBasedOnContainer.bind(this);

    this._initBinds();
  },

  render: function () {
    var attributions = _.compact(this.map.get('attribution')).join(', ');
    var isGMaps = this.map.get('provider') !== 'leaflet';
    this.$el.html(
      template({
        attributions: Sanitize.html(attributions)
      })
    );
    this.$el.toggleClass('CDB-Attribution--gmaps', !!isGMaps);
    this._toggleAttributionsBasedOnContainer();

    return this;
  },

  _initBinds: function () {
    this.model.bind('change:visible', function (mdl, isVisible) {
      this[ isVisible ? '_showAttributions' : '_hideAttributions' ]();
    }, this);
    this.map.bind('change:attribution', this.render, this);
    this.add_related_model(this.map);
    $(window).on('resize', this._toggleAttributionsBasedOnContainer);
  },

  _enableDocumentBinds: function () {
    $(document).on('keydown', this._onDocumentKeyDown);
  },

  _disableDocumentBinds: function () {
    $(document).off('keydown', this._onDocumentKeyDown);
  },

  _onDocumentKeyDown: function (ev) {
    if (ev && ev.keyCode === 27) {
      this._toggleAttributions();
    }
  },

  _showAttributions: function () {
    this.$el.addClass('is-active');
    this._enableDocumentBinds();
  },

  _hideAttributions: function () {
    this.$el.removeClass('is-active');
    this._disableDocumentBinds();
  },

  _toggleAttributions: function () {
    this.model.set('visible', !this.model.get('visible'));
  },

  _toggleAttributionsBasedOnContainer: function () {
    var MAP_CONTAINER_MOBILE_WIDTH = 650;
    if (this.map.getMapViewSize().x > MAP_CONTAINER_MOBILE_WIDTH) {
      this.model.set('visible', true);
    } else {
      this.model.set('visible', false);
    }
  },

  clean: function () {
    this._disableDocumentBinds();
    $(window).off('resize', this._toggleAttributionsBasedOnContainer);
    View.prototype.clean.call(this);
  }
});
