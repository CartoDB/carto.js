var Overlay = require('./vis/overlay');

/**
 * Manages the infowindows for a map. It listens to changes on the collection
 * of layers and binds a new infowindow view/model to CartoDB.js whenever the
 * collection of layers changes
 */
var InfowindowManager = function (vis, options) {
  options = options || {};
  this._vis = vis;
  this._showEmptyFields = options.showEmptyFields;
};

InfowindowManager.prototype.manage = function (mapView, map) {
  this._mapView = mapView;
  this._map = map;

  this._map.layers.bind('reset', function (layers) {
    layers.each(this._addInfowindowForLayer, this);
  }, this);
  this._map.layers.each(this._addInfowindowForLayer, this);
  this._map.layers.bind('add', this._addInfowindowForLayer, this);
};

InfowindowManager.prototype._addInfowindowForLayer = function (layerModel) {
  if (layerModel.infowindow) {
    var layerView = this._mapView.getLayerViewByLayerCid(layerModel.cid);

    if (!this._infowindowView) {
      this._addInfowindowOverlay(layerView, layerModel);
      this._bindFeatureClickEvent(layerView);
    }
    this._bindInfowindowModel(layerView, layerModel);

    layerView.bind('mouseover', function () {
      this._mapView.setCursor('pointer');
    }, this);

    layerView.bind('mouseout', function (m, layer) {
      this._mapView.setCursor('auto');
    }, this);
  }
};

InfowindowManager.prototype._addInfowindowOverlay = function (layerView, layerModel) {
  this._infowindowView = Overlay.create('infowindow', this._vis, layerModel.infowindow.toJSON());
  this._infowindowModel = this._infowindowView.model;
  this._mapView.addInfowindow(this._infowindowView);
};

InfowindowManager.prototype._bindFeatureClickEvent = function (layerView) {
  layerView.bind('featureClick', function (e, latlng, pos, data, layerIndex) {
    var layerModel = layerView.model.getLayerAt(layerIndex);
    if (!layerModel) {
      throw new Error('featureClick event for layer ' + layerIndex + ' was captured but layerModel coudn\'t be retrieved');
    }

    if (!layerModel.infowindow.hasFields()) {
      return;
    }

    this._updateInfowindowModel(layerModel.infowindow);

    this._infowindowModel.set({
      latlng: latlng,
      visibility: true
    });

    this._fetchAttributes(layerView, layerModel, data.cartodb_id, latlng);

    if (layerView.tooltipView) {
      layerView.tooltipView.setFilter(function (feature) {
        return feature.cartodb_id !== data.cartodb_id;
      }).hide();
    }

    var clearFilter = function (infowindowModel) {
      if (!infowindowModel.get('visibility')) {
        layerView.tooltipView.setFilter(null);
      }
    };

    this._infowindowModel.unbind('change:visibility', clearFilter);
    this._infowindowModel.once('change:visibility', clearFilter);
  }, this);
};

InfowindowManager.prototype._updateInfowindowModel = function (infowindowTemplate) {
  this._infowindowModel.setInfowindowTemplate(infowindowTemplate);
};

InfowindowManager.prototype._fetchAttributes = function (layerView, layerModel, featureId) {
  this._currentFeatureId = featureId || this._currentFeatureId;
  this._infowindowModel.setLoading();

  var layerIndex = layerView.model.getIndexOf(layerModel);
  layerView.model.fetchAttributes(layerIndex, this._currentFeatureId, function (attributes) {
    if (attributes) {
      this._infowindowModel.updateContent(attributes, {
        showEmptyFields: this._showEmptyFields
      });
    } else {
      this._infowindowModel.setError();
    }
  }.bind(this));
};

InfowindowManager.prototype._bindInfowindowModel = function (layerView, layerModel) {
  layerModel.infowindow.bind('change', function () {
    if (this._infowindowModel.hasInfowindowTemplate(layerModel.infowindow) && this._infowindowModel.get('visibility') === true) {
      this._updateInfowindowModel(layerModel.infowindow);
    }
  }, this);

  layerModel.infowindow.fields.bind('reset', function () {
    if (layerModel.infowindow.hasFields()) {
      if (this._infowindowModel.hasInfowindowTemplate(layerModel.infowindow)) {
        this._updateInfowindowModel(layerModel.infowindow);
        if (this._infowindowModel.get('visibility')) {
          this._reloadMapAndFetchAttributes(layerView, layerModel);
          return;
        }
      }

      this._reloadMap();
    } else {
      if (this._infowindowModel.hasInfowindowTemplate(layerModel.infowindow)) {
        this._infowindowModel.set('visibility', false);
      }
    }
  }, this);
};

InfowindowManager.prototype._reloadMap = function (options) {
  options = options || {};
  this._map.reload(options);
};

InfowindowManager.prototype._reloadMapAndFetchAttributes = function (layerView, layerModel) {
  this._reloadMap({
    success: function () {
      this._fetchAttributes(layerView, layerModel);
    }.bind(this)
  });
};

module.exports = InfowindowManager;
