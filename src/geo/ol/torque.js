(function() {

if(typeof(ol) === "undefined") 
  return;

/**
 * Open layers torque layer
 */
cdb.geo.OpenLayersTorqueLayer = function(layerModel, map){
  var extra = layerModel.get('extra_params');

  var query = this._getQuery(layerModel);

  this.options = _.clone(layerModel.attributes);

  ol.TorqueLayer.call(this,
    {
      table: layerModel.get('table_name'),
      user: layerModel.get('user_name'),
      column: layerModel.get('property'),
      blendmode: layerModel.get('torque-blend-mode'),
      resolution: 1,
      //TODO: manage time columns
      countby: 'count(cartodb_id)',
      sql_api_domain: layerModel.get('sql_api_domain'),
      sql_api_protocol: layerModel.get('sql_api_protocol'),
      sql_api_port: layerModel.get('sql_api_port'),
      tiler_protocol: layerModel.get('tiler_protocol'),
      tiler_domain: layerModel.get('tiler_domain'),
      tiler_port: layerModel.get('tiler_port'),
      maps_api_template: layerModel.get('maps_api_template'),
      stat_tag: layerModel.get('stat_tag'),
      animationDuration: layerModel.get('torque-duration'),
      steps: layerModel.get('torque-steps'),
      sql: query,
      visible: layerModel.get('visible'),
      extra_params: {
        api_key: extra ? extra.map_key: ''
      },
      cartodb_logo: layerModel.get('cartodb_logo'),
      attribution: layerModel.get('attribution'),
      cartocss: layerModel.get('cartocss') || layerModel.get('tile_style'),
      named_map: layerModel.get('named_map'),
      auth_token: layerModel.get('auth_token'),
      no_cdn: layerModel.get('no_cdn'),
      dynamic_cdn: layerModel.get('dynamic_cdn'),
      loop: layerModel.get('loop') === false? false: true,
      instanciateCallback: function() {
        var cartocss = layerModel.get('cartocss') || layerModel.get('tile_style');

        return '_cdbct_' + cdb.core.util.uniqueCallbackName(cartocss + query);
      }
    });
  
  this.fire = this.trigger;

  this.set = function(k,v){};
  this.setZIndex = function(index){};

  cdb.geo.OpenLayersBaseLayerView.call(this, layerModel, this, map);

  this.bind('tilesLoaded', function() {
    Backbone.Events.trigger.call(this, 'load');
  }, this);

  this.bind('tilesLoading', function() {
    Backbone.Events.trigger.call(this, 'loading');
  }, this);
};

_.extend(cdb.geo.OpenLayersTorqueLayer.prototype,
    ol.TorqueLayer.prototype,
    cdb.geo.OpenLayersBaseLayerView.prototype,
    { 
      add: function() {
        this.onAdd(this.map_ol);
        this.trigger('added');

        if (this.model.get('visible')) {
          this.play();
        }

        if (this.model.get('cartodb_logo') != false)
          cdb.geo.common.CartoDBLogo.addWadus({ left:8, bottom:8 }, 0, this.map_ol.getTarget());
      },

      remove: function(){
        this.onRemove();
        this.setMap(undefined);
        this.trigger('remove');
      },

      _getQuery: function(layerModel) {
        var query = layerModel.get('query');
        var qw = layerModel.get('query_wrapper');
        if(qw) {
          query = _.template(qw)({ sql: query || ('select * from ' + layerModel.get('table_name')) });
        }
        return query;
      },

      _update: function(model) {
        var changed = this.model.changedAttributes();
        if(changed === false) return;
        changed.tile_style && this.setCartoCSS(this.model.get('tile_style'));
        if ('query' in changed || 'query_wrapper' in changed) {
          this.setSQL(this._getQuery(this.model));
        }

        if ('visible' in changed) 
          this.model.get('visible') ? this.show(): this.hide();

      }
});

})();
