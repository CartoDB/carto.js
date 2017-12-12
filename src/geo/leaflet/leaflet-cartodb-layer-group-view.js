var _ = require('underscore');
var L = require('leaflet');
var C = require('../../constants');
var LeafletLayerView = require('./leaflet-layer-view');
var CartoDBLayerGroupViewBase = require('../cartodb-layer-group-view-base');
// TODO: Include this from npm
var zera = require('../../../vendor/zera');
var EMPTY_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

var findContainerPoint = function (map, o) {
  var curleft = 0;
  var curtop = 0;
  var obj = map.getContainer();

  var x, y;
  if (o.e.changedTouches && o.e.changedTouches.length > 0) {
    x = o.e.changedTouches[0].clientX + window.scrollX;
    y = o.e.changedTouches[0].clientY + window.scrollY;
  } else {
    x = o.e.clientX;
    y = o.e.clientY;
  }

  // If the map is fixed at the top of the window, we can't use offsetParent
  // cause there might be some scrolling that we need to take into account.
  var point;
  if (obj.offsetParent && obj.offsetTop > 0) {
    do {
      curleft += obj.offsetLeft;
      curtop += obj.offsetTop;
      obj = obj.offsetParent;
    } while (obj);
    point = new L.Point(
      x - curleft, y - curtop);
  } else {
    var rect = obj.getBoundingClientRect();
    var scrollX = (window.scrollX || window.pageXOffset);
    var scrollY = (window.scrollY || window.pageYOffset);
    point = new L.Point(
      (o.e.clientX ? o.e.clientX : x) - rect.left - obj.clientLeft - scrollX,
      (o.e.clientY ? o.e.clientY : y) - rect.top - obj.clientTop - scrollY);
  }

  return point;
};

var LeafletCartoDBLayerGroupView = function (layerModel, opts) {
  LeafletLayerView.apply(this, arguments);
  CartoDBLayerGroupViewBase.apply(this, arguments);

  this.leafletLayer.on('load', function () {
    this.trigger('load');
  }.bind(this));

  this.leafletLayer.on('loading', function () {
    this.trigger('loading');
  }.bind(this));

  this.leafletLayer.on('tileerror', function (layer) {
    this.model.addError({ type: C.WINDSHAFT_ERRORS.TILE });
  }.bind(this));
};

LeafletCartoDBLayerGroupView.prototype = _.extend(
  {},
  LeafletLayerView.prototype,
  CartoDBLayerGroupViewBase.prototype,
  {
    interactionClass: zera.Interactive,

    _createLeafletLayer: function () {
      var tileLayer = new L.TileLayer(null, {
        opacity: 0.99,
        maxZoom: 30
      });
      tileLayer._setUrl = function (url, noDraw) {
        return L.TileLayer.prototype.setUrl.call(this, url, noDraw);
      };
      return tileLayer;
    },

    _reload: function () {
      var tileURLTemplate = this.model.getTileURLTemplate();
      var subdomains = this.model.getSubdomains();

      if (!tileURLTemplate) {
        tileURLTemplate = EMPTY_GIF;
      }

      if (subdomains) {
        L.Util.setOptions(this.leafletLayer, {subdomains: subdomains});
      }

      this.leafletLayer._setUrl(tileURLTemplate);

      this._reloadInteraction();
    },

    _manageOffEvents: function (nativeMap, waxEvent) {
      this._onFeatureOut(waxEvent.layer);
    },

    _manageOnEvents: function (nativeMap, waxEvent) {
      var containerPoint = findContainerPoint(nativeMap, waxEvent);

      if (!containerPoint || isNaN(containerPoint.x) || isNaN(containerPoint.y)) {
        return false;
      }

      var latlng = nativeMap.containerPointToLatLng(containerPoint);

      var eventType = waxEvent.e.type.toLowerCase();

      switch (eventType) {
        case 'mousemove':
          this._onFeatureOver(latlng, containerPoint, waxEvent.data, waxEvent.layer);
          break;
        case 'click':
          this._onFeatureClicked(latlng, containerPoint, waxEvent.data, waxEvent.layer);
          break;
      }
    },

    _onFeatureClicked: function (latlon, containerPoint, data, layer) {
      var layerModel = this.model.getLayerInLayerGroupAt(layer);
      if (layerModel) {
        this.trigger('featureClick', {
          layer: layerModel,
          layerIndex: layer,
          latlng: [latlon.lat, latlon.lng],
          position: containerPoint,
          feature: data
        });
      }
    },

    _onFeatureOver: function (latlon, containerPoint, data, layer) {
      var layerModel = this.model.getLayerInLayerGroupAt(layer);
      if (layerModel) {
        this.trigger('featureOver', {
          layer: layerModel,
          layerIndex: layer,
          latlng: [latlon.lat, latlon.lng],
          position: containerPoint,
          feature: data
        });
      }
    },

    _onFeatureOut: function (layerIndex) {
      var layerModel = this.model.getLayerInLayerGroupAt(layerIndex);
      if (layerModel) {
        this.trigger('featureOut', {
          layer: layerModel,
          layerIndex: layerIndex
        });
      }
    }
  }
);

LeafletCartoDBLayerGroupView.prototype.constructor = LeafletLayerView;

module.exports = LeafletCartoDBLayerGroupView;
