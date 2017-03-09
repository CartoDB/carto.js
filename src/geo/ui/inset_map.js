/* global $:false, _:false, L:false */

cdb.geo.ui.InsetMap = cdb.core.View.extend({

  ANIMATION_DURATION_MS: 150,

  AIMING_RECT_OPTIONS: {
    color: '#000000',
    weight: 1,
    clickable: false
  },

  tagName: 'div',
  className: 'cartodb-inset-map-box',

  default_options: {
    timeout: 0,
    msg: ''
  },

  initialize: function () {
    this.map = this.options.mapView.map;
    this.mapView = this.options.mapView;
    this._leafletMap = this.mapView.getNativeMap();

    this.add_related_model(this.mapView);

    this.map = this.options.map;

    _.defaults(this.options, this.default_options);

    this._setupModels();
    this._addMiniMapControl();
    this._setupEvents();
  },

  show: function () {
    if (this.$control) {
      this.$control.show();
      this.miniMapControl._miniMap.invalidateSize();
    }
  },

  hide: function () {
    if (this.$control) {
      this.$control.hide();
    }
  },

  _addMiniMapControl: function () {
    if (this.map.get('provider') !== 'leaflet') {
      if (console && console.error) {
        console.error('CartoDB InsetMap overlay requires a leaflet basemap');
      }
      // Do nothing
      // TODO: Better handle this
      return;
    }

    var miniMapConfig = {
      position: this._getLeafletPosition(),
      aimingRectOptions: this.AIMING_RECT_OPTIONS,
      zoomLevelOffset: -6
    };
    this.miniMapControl = new L.Control.MiniMap(this._getMiniMapLayer(), miniMapConfig)
                          .addTo(this._leafletMap);
  },

  // Setup the internal and custom model
  _setupModels: function () {
    this.model = this.options.model;
    var options = this.model.get('options');
    this.model.set(options);

    if (!this.model.get('xPosition')) {
      this.model.set('xPosition', 'left');
    }
    if (!this.model.get('yPosition')) {
      this.model.set('yPosition', 'top');
    }

    this.model.on('change:display', this._onChangeDisplay, this);
    this.model.on('change:y', this._onChangeY, this);
    this.model.on('change:x', this._onChangeX, this);
    this.model.on('change:xPosition', this._onChangePosition, this);
    this.model.on('change:yPosition', this._onChangePosition, this);

    this.model.on('destroy', this._onDestroy, this);
  },

  _setupEvents: function () {
    $(window).on('resize', $.proxy(this._onWindowResize, this));
    this.map.on('savingLayersFinish', this._onBaseLayerChanged, this);
  },

  _getMiniMapLayer: function () {
    var baseLayer = this.map.getBaseLayer();
    // Default to showing the first layer in the CartoDB default basemaps (currently Positron)
    // TODO: No access to DEFAULT_BASEMAPS in cartodb.js. Used a static url for now,
    // consider other options, or maybe we can just remove this fallback?
    // var positron = cdb.admin.DEFAULT_BASEMAPS.CartoDB[0];
    var positron = {url: 'http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png'};
    var url = baseLayer.get('url') || baseLayer.get('urlTemplate') || positron.url;
    var config = _.extend({}, positron, baseLayer);
    return new L.TileLayer(url, config);
  },

  _getLeafletPosition: function () {
    var xPos = this.model.get('xPosition');
    var yPos = this.model.get('yPosition');
    return xPos === undefined || yPos === undefined ? 'topleft' : yPos + xPos;
  },

  _onWindowResize: function () {
    if (this.miniMapControl) {
      this.miniMapControl._miniMap.invalidateSize();
    }
  },

  _onChangeDisplay: function () {
    if (this.model.get('display')) {
      this.show();
    } else {
      this.hide();
    }
  },

  _onChangeX: function () {
    if (!this.$control) {
      return;
    }

    var x = this.model.get('x');
    var position = this.model.get('xPosition');
    if (position === 'left') {
      this.$control.animate({ left: x }, this.ANIMATION_DURATION_MS);
    } else {
      this.$control.animate({ right: x }, this.ANIMATION_DURATION_MS);
    }

    this.trigger('change_x', this);
  },

  _onChangeY: function () {
    if (!this.$control) {
      return;
    }

    var y = this.model.get('y');
    var position = this.model.get('yPosition');
    if (position === 'top') {
      this.$control.animate({ top: y }, this.ANIMATION_DURATION_MS);
    } else {
      this.$control.animate({ bottom: y }, this.ANIMATION_DURATION_MS);
    }

    this.trigger('change_y', this);
  },

  _onChangePosition: function () {
    var controlPosition = this.miniMapControl.getPosition();
    var position = this._getLeafletPosition();
    if (position !== controlPosition) {
      this.hide();
      this.miniMapControl.setPosition(position);
      // Re-render because the control is destroyed on a setPosition call
      this.trigger('reposition', this);
      this.model.save();
      this.render();
    }
  },

  _onBaseLayerChanged: function () {
    this.renderBackgroundColor();
    this.miniMapControl.changeLayer(this._getMiniMapLayer());
  },

  _onDestroy: function () {
    $(window).off('resize', $.proxy(this._onWindowResize, this));
    this.map.off('savingLayersFinish', this._onBaseLayerChanged);
    this._leafletMap.removeControl(this.miniMapControl);
  },

  _getMap: function () {
    return this.mapView.getNativeMap();
  },

  render: function () {
    // Don't attach to this.$el because then the inset map element ends up outside the
    // leaflet-controls container which causes trouble

    if (!this.miniMapControl) {
      return this;
    }

    var css = {};
    css[this.model.get('xPosition')] = this.model.get('x');
    css[this.model.get('yPosition')] = this.model.get('y');
    this.$control = $(this.miniMapControl.getContainer());
    this.$control.css(css);

    this.renderBackgroundColor();
    if (this.model.get('display')) {
      this.show();
    }

    return this;
  },

  renderBackgroundColor: function () {
    var layer = this.map.getBaseLayer();
    var color = layer.get('color') || '';
    if (this.$control) {
      this.$control.css({ 'background': color });
    }
  }

});
