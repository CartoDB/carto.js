(function() {
    if (typeof(ol) === "undefined") return;

    var default_options = {
      opacity:        0.99,
      attribution:    cdb.config.get('cartodb_attributions'),
      debug:          false,
      visible:        true,
      added:          false,
      tiler_domain:   "cartodb.com",
      tiler_port:     "80",
      tiler_protocol: "http",
      sql_api_domain:     "cartodb.com",
      sql_api_port:       "80",
      sql_api_protocol:   "http",
      extra_params:   {
      },
      cdn_url:        null,
      subdomains:     null
    };

    var CartodbNamedMap = function(opts) {

      this.options = _.defaults(opts, default_options);
      this.tiles = 0;
      this.tilejson = null;
      this.interaction = [];

      if (!opts.named_map && !opts.sublayers) {
          throw new Error('cartodb-ol needs at least the named_map');
      }

      // Add CartoDB logo
      if (this.options.cartodb_logo != false)
        cdb.geo.common.CartoDBLogo.addWadus({ left: 74, bottom:8 }, 2000, this.options.map.getTarget());
      // lovely wax connector overwrites options so set them again
      // TODO: remove wax.connector here
       _.extend(this.options, opts);
      
      NamedMap.call(this, this.options.named_map, this.options);
      CartoDBLayerCommon.call(this);
    };

    //TODO: research this interation class
    CartodbNamedMap.prototype.interactionClass = wax.ol.interaction;

    _.extend(CartodbNamedMap.prototype, LayerDefinition.prototype, CartoDBLayerCommon.prototype);

    var CartodbLayerGroup = function(opts) {

      this.options = _.defaults(opts, default_options);
      this.tiles = {};
      this.tilejson = null;
      this.interaction = [];

      if (!opts.layer_definition && !opts.sublayers) {
          throw new Error('cartodb-ol needs at least the layer_definition or sublayer list');
      }

      // if only sublayers is available, generate layer_definition from it
      if(!opts.layer_definition) {
        opts.layer_definition = LayerDefinition.layerDefFromSubLayers(opts.sublayers);
      }

      // Add CartoDB logo
      if (this.options.cartodb_logo != false)
        cdb.geo.common.CartoDBLogo.addWadus({ left: 74, bottom:8 }, 2000, this.options.map.getTarget());

      LayerDefinition.call(this, opts.layer_definition, this.options);
      CartoDBLayerCommon.call(this);
    };

    //TODO: research this interation class
    CartodbLayerGroup.prototype.interactionClass =  wax.ol.interaction;

    _.extend(CartodbLayerGroup.prototype, LayerDefinition.prototype, CartoDBLayerCommon.prototype);


    function LayerGroupView(base) {
      var OpenLayersCartodbLayerGroupView = function(layerModel, map_ol) {
        var self = this;
        var hovers = [];

        _.bindAll(this, 'featureOut', 'featureOver', 'featureClick');

        var opts = _.clone(layerModel.attributes);

        opts.map =  map_ol;
      
        var // preserve the user's callbacks
        _featureOver  = opts.featureOver,
        _featureOut   = opts.featureOut,
        _featureClick = opts.featureClick;

        var previousEvent;
        var eventTimeout = -1;

        opts.featureOver  = function(e, latlon, pxPos, data, layer) {
          if (!hovers[layer]) {
            self.trigger('layerenter', e, latlon, pxPos, data, layer);
          }
          hovers[layer] = 1;
          _featureOver  && _featureOver.apply(this, arguments);
          self.featureOver  && self.featureOver.apply(this, arguments);

          // if the event is the same than before just cancel the event
          // firing because there is a layer on top of it
          if (e.timeStamp === previousEvent) {
            clearTimeout(eventTimeout);
          }

          table.mapTab.setTooltipLayer(layer);

          eventTimeout = setTimeout(function() {
            self.trigger('mouseover', e, latlon, pxPos, data, layer);
            self.trigger('layermouseover', e, latlon, pxPos, data, layer);
          }, 0);
          previousEvent = e.timeStamp;
        };

        opts.featureOut  = function(m, layer) {
          if (hovers[layer]) {
            self.trigger('layermouseout', layer);
          }
          hovers[layer] = 0;
          if(!_.any(hovers)) {
            self.trigger('mouseout');
          }
          _featureOut  && _featureOut.apply(this, arguments);
          self.featureOut  && self.featureOut.apply(this, arguments);
        };

        opts.featureClick  = _.debounce(function(e, latlon, pxPos, data, layer) {
          table.mapTab.setInfowindowLayer(layer);
          
          _featureClick  && _featureClick.apply(this, arguments);
          self.featureClick  && self.featureClick.apply(opts, arguments);
        }, 10);

        base.call(this, opts);

        cdb.geo.OpenLayersBaseLayerView.call(this, layerModel, new ol.layer.Tile(), map_ol);

        this._tilesCount = 0;
      };

      _.extend(
        OpenLayersCartodbLayerGroupView.prototype,
        cdb.geo.OpenLayersBaseLayerView.prototype,
        CartoDBLayerCommon.prototype,
        base.prototype,
        {
        _modelUpdated: function() {
            this.setLayerDefinition(this.model.get('layer_definition'));
        },
        /**
           * Bind events for wax interaction
           * @param {Object} Layer map object
           * @param {Event} Wax event
           */
        _manageOnEvents: function(map, o) {
            var pixel = map.getEventPixel(o.e);
            var coord = ol.proj.toLonLat(map.getEventCoordinate(o.e));
            var event_type = o.e.type.toLowerCase();
 
            switch (event_type) {
                case 'mousemove':
                if (this.options.featureOver) {
                  return this.options.featureOver(o.e, 
                    {
                        lat: coord[1], 
                        lng: coord[0]
                    }, 
                    {
                        x: pixel[0], 
                        y: pixel[1] 
                    }, o.data, o.layer);
                }
                break;

                case 'click':
                case 'touchend':
                case 'touchmove': // for some reason android browser does not send touchend
                case 'mspointerup':
                case 'pointerup':
                case 'pointermove':
                    if (this.options.featureClick) {
                      this.options.featureClick(o.e,
                        {
                            lat: coord[1], 
                            lng: coord[0]}, 
                        {
                            x: pixel[0], y: pixel[1]
                        }, 
                        o.data, 
                        o.layer);
                    }
                    break;
                default:
                    break;
            }
        },
        /**
        * Bind off event for wax interaction
        */
        _manageOffEvents: function(map, o) {
            if (this.options.featureOut) {
              return this.options.featureOut && this.options.featureOut(o.e, o.layer);
            }
        },
        add: function(){
          if(this.options.added === false){
            this.options.map = this.map_ol;
            this.update();
            cdb.geo.OpenLayersBaseLayerView.prototype.add.call(self);     
            this.options.added = true;
          }
        },
        _update: function() {
          this.setOptions(this.model.attributes);
        },
        
        reload: function() {
          this.model.invalidate();
        },

        remove: function() {
            if(this.options.added === true) {
                cdb.geo.OpenLayersBaseLayerView.prototype.remove.call(this);
                this.clear();
                this.options.added = false;
            }
        },

        clear: function () {
            this._clearInteraction();
            self.finishLoading && self.finishLoading();
        },

        featureOver: function(e, latlon, pixelPos, data, layer) {
          // dont pass gmaps LatLng
          this.trigger('featureOver', e, [latlon.lat, latlon.lng], pixelPos, data, layer);
        },

        featureOut: function(e, layer) {
          this.trigger('featureOut', e, layer);
        },

        featureClick: function(e, latlon, pixelPos, data, layer) {
          // dont pass leaflet lat/lon
          this.trigger('featureClick', e, [latlon.lat, latlon.lng], pixelPos, data, layer);
        },

        error: function(e) {
          if(this.model) {
            //trigger the error form _checkTiles in the model
            this.model.trigger('error', e?e.errors:'unknown error');
            this.model.trigger('tileError', e?e.errors:'unknown error');
          }
        }, 
 
        ok: function(e) {
          this.model.trigger('tileOk');
        },

        tilesOk: function(e) {
          this.model.trigger('tileOk');
        },

        loading: function() {
          this.trigger("loading");
        },

        finishLoading: function() {
          this.trigger("load");
        },

        setOpacity: function(opacity) {
            this.layer_ol.setOpacity(opacity);
        },

        update: function(){
            self = this;
            self.trigger('updated');
            self.loading();
            self.getTiles(function(urls, err) {
                if(urls) {
                  self.tilejson = urls;
                  self.options.tiles = urls.tiles;  

                  if(self._source){
                    self.tiles = {};
                    self._source.un('tileloadstart', self._tileloadstart, self);
                    self._source.un('tileloaderror', self._tileloadended, self);
                    self._source.un('tileloadend', self._tileloadended, self);
                  }

                  self._source = new ol.source.XYZ({ urls: urls["tiles"] });
                  self._source.on('tileloadstart', self._tileloadstart, self);
                  self._source.on('tileloaderror', self._tileloadended, self);
                  self._source.on('tileloadend', self._tileloadended, self);

                  self.layer_ol.setSource(self._source);
                  self._reloadInteraction();
                  self.ok && self.ok();
                  self.finishLoading();
                } else {
                  self.error && self.error(err)
                }
                });
        },

        _tileloadstart: function(e){
          if(this._tilesCount == 0) {
            this.loading();
          }

          this._tilesCount++;
        },

        _tileloadended: function(e){
            this.tiles[e.tile.getTileCoord()] = e.tile;
            this._tilesCount--;  

            if(this._tilesCount == 0) {
              this.finishLoading();
            }
        },

        onLayerDefinitionUpdated: function() {
            this.update();
        }
        });

        return OpenLayersCartodbLayerGroupView;
    }

    cdb.geo.OpenLayersCartodbLayerGroupView = LayerGroupView(CartodbLayerGroup);
    cdb.geo.OpenLayersCartodbNamedMapView = LayerGroupView(CartodbNamedMap);

})();