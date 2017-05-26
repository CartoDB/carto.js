var _ = require('underscore');

/**
 * Implementation of all common logic of a torque-layer view.
 * All the methods and attributes here need to be consistent across all implementing models.
 *
 * Methods are prefixed with _ to indicate that they are not intended to be used outside the implementing models.
 * @ignore
 */
var TorqueLayerViewBase = {
  setNativeTorqueLayer: function (nativeTorqueLayer) {
    var model = this.model;
    this.nativeTorqueLayer = nativeTorqueLayer;
    if (model.get('visible')) {
      this.nativeTorqueLayer.play();
    }

    this.nativeTorqueLayer.on('tilesLoaded', function () {
      this.trigger('load');
    }, this);

    this.nativeTorqueLayer.on('tilesLoading', function () {
      this.trigger('loading');
    }, this);

    this.nativeTorqueLayer.on('change:time', function (changes) {
      this._setModelAttrs({
        step: changes.step,
        time: changes.time,
        renderRange: {
          start: changes.start,
          end: changes.end
        }
      });
    }, this);

    this.nativeTorqueLayer.on('change:steps', function (changes) {
      this._setModelAttrs({ steps: changes.steps });
    }, this);

    this.nativeTorqueLayer.on('play', function () {
      this._callModel('play');
    }, this);

    this.nativeTorqueLayer.on('pause', function () {
      this._callModel('pause');
    }, this);

    var steps = model.get('torque-steps') ||
      (this.nativeTorqueLayer.provider && this.nativeTorqueLayer.provider.getSteps()) ||
      this.nativeTorqueLayer.options.steps || 0;

    model.set({
      isRunning: this.nativeTorqueLayer.isRunning(),
      time: this.nativeTorqueLayer.getTime(),
      step: this.nativeTorqueLayer.getStep(),
      steps: steps
    });

    this._onModel();
  },

  _initialAttrs: function (model) {
    return {
      table: model.get('table_name'),
      user: model.get('user_name'),
      column: model.get('property'),
      blendmode: model.get('torque-blend-mode'),
      resolution: 1,
      // TODO: manage time columns
      countby: 'count(cartodb_id)',
      maps_api_template: model.get('maps_api_template'),
      stat_tag: model.get('stat_tag'),
      animationDuration: model.get('torque-duration'),
      steps: model.get('torque-steps'),
      sql: this._getQuery(model),
      visible: model.get('visible'),
      extra_params: {
        api_key: model.get('api_key')
      },
      attribution: model.get('attribution'),
      cartocss: model.get('cartocss') || model.get('tile_style'),
      named_map: model.get('named_map'),
      auth_token: model.get('auth_token'),
      no_cdn: model.get('no_cdn'),
      loop: !(model.get('loop') === false)
    };
  },

  /**
   * Set model property but unon changes first in order to not create an infinite loop
   */
  _setModelAttrs: function (attrs) {
    this._unonModel();
    this.model.set(attrs);
    this._onModel();
  },

  _callModel: function (method) {
    this._unonModel();
    var args = Array.prototype.slice.call(arguments, 1);
    this.model[method].apply(this.model, args);
    this._onModel();
  },

  _onModel: function () {
    this._unonModel();
    this.listenTo(this.model, 'change:isRunning', this._isRunningChanged);
    this.listenTo(this.model, 'change:time', this._timeChanged);
    this.listenTo(this.model, 'change:step', this._stepChanged);
    this.listenTo(this.model, 'change:steps', this._stepsChanged);
    this.listenTo(this.model, 'change:renderRange', this._renderRangeChanged);
  },

  _unonModel: function () {
    this.stopListening(this.model, 'change:isRunning', this._isRunningChanged);
    this.stopListening(this.model, 'change:time', this._timeChanged);
    this.stopListening(this.model, 'change:step', this._stepChanged);
    this.stopListening(this.model, 'change:steps', this._stepsChanged);
    this.stopListening(this.model, 'change:renderRange', this._renderRangeChanged);
  },

  _isRunningChanged: function (m, isRunning) {
    if (isRunning) {
      this.nativeTorqueLayer.play();
    } else {
      this.nativeTorqueLayer.pause();
    }
  },

  _timeChanged: function (m, time) {
    this.nativeTorqueLayer.setStep(this.nativeTorqueLayer.timeToStep(time));
  },

  _stepChanged: function (m, step) {
    this.nativeTorqueLayer.setStep(step);
  },

  _stepsChanged: function (m, steps) {
    this.nativeTorqueLayer.setSteps(steps);
  },

  _renderRangeChanged: function (m, r) {
    if (_.isObject(r) && _.isNumber(r.start) && _.isNumber(r.end)) {
      this.nativeTorqueLayer.renderRange(r.start, r.end);
    } else {
      this.nativeTorqueLayer.resetRenderRange();
    }
  },

  _getQuery: function (layerModel) {
    var query = layerModel.get('query');
    var qw = layerModel.get('query_wrapper');
    if (qw) {
      query = _.template(qw)({ sql: query || ('select * from ' + layerModel.get('table_name')) });
    }
    return query;
  }
};

module.exports = TorqueLayerViewBase;
