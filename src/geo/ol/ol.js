/**
 * Open Layers implementation of a map
 */

(function() {
    if (typeof(ol) === "undefined")
        return;
    
    /**
     * Open Layers implementation
     */
    cdb.geo.OpenLayersMapView = cdb.geo.MapView.extend({
        initialize: function() {
            this.myName = 'OpenLayersMapView';

            _.bindAll(this, '_addLayer', '_removeLayer', '_setZoom', '_setCenter', '_setView');
            cdb.geo.MapView.prototype.initialize.call(this);

            this._attributionElement = document.createElement("DIV");
            this._attributionElement.classList.add("ol-cartodb-attribution");
            this._attributionElement.classList.add("attribution");

            if (!this.options.map_object) {
                var modelCenter = this.map.get('center');
                this.view_ol = new ol.View({
                        center: ol.proj.fromLonLat([modelCenter[1], modelCenter[0]]),
                        zoom: this.map.get('zoom')
                    });
                this.map_ol = new ol.Map({
                    target: this.el,
                    view: this.view_ol,
                    interactions: ol.interaction.defaults({
                        dragPan: false
                        }).extend([new ol.interaction.DragPan({kinetic: false})]),
                    controls: ol.control.defaults({
                    attribution: false,
                    zoom : false
                }).extend([new ol.control.Control({ element: this._attributionElement })])});
            }

            this.map.bind('set_view', this._setView, this);
            this.map.layers.bind('add', this._addLayer, this);
            this.map.layers.bind('remove', this._removeLayer, this);
            this.map.layers.bind('reset', this._addLayers, this);
            this.map.layers.bind('change:type', this._swicthLayerView, this);

            //this.map.geometries.bind('add', this._addGeometry, this);
            //this.map.geometries.bind('remove', this._removeGeometry, this);

            this.map_ol.on('click', function(e){
                var coord = ol.proj.toLonLat(e.coordinate);
                this.trigger('click', e.originalEvent, [coord[1], coord[0]]);
            }, this);

            this.map_ol.on('dblclick', function(e) {
                this.trigger('dblclick', e.originalEvent);
            });

            this.map_ol.on('pointerdrag', function(e){
                this._updateModelCenter();
                this.trigger('drag');
            }, this);

            this.map_ol.on('moveend', function(e){
                var center = ol.proj.toLonLat(this.view_ol.getCenter());
                this.trigger('dragend', [center[1], center[0]]);
            }, this);

            this.view_ol.on('change:center', function(){
                this._updateModelCenter();
            }, this);

            this._postcomposeKey = undefined;


            //simulating zoom events as OpenLayers map does not provide them
            this.view_ol.on('change:resolution', function(){
                this._currentResolution = this.view_ol.getResolution();
                if(this._postcomposeKey) return;
                this.trigger("zoomstart");

                this._postcomposeKey = this.map_ol.on("postcompose", function(evt) {
                    if(evt.frameState.viewState.resolution === this._currentResolution){
                        this._setModelProperty({ zoom: this.view_ol.getZoom() });
                        var center = ol.proj.toLonLat(this.view_ol.getCenter());
                        this._setModelProperty({ center: [center[1], center[0]]});

                        this.map_ol.unByKey(this._postcomposeKey);
                        this._postcomposeKey = undefined;
                        this.trigger("zoomend");
                    }
                }, this);
            }, this);

            this._bindModel();
            this._addLayers();
            this.setAttribution();

            this.trigger('ready');

            var bounds = this.map.getViewBounds();

            if (bounds) {
                this.showBounds(bounds);
            }
        },

        showBounds: function(bounds){
            var extent = [bounds[0][1], bounds[0][0], bounds[1][1], bounds[1][0]];
            var transformedExtent = ol.proj.transformExtent(extent, "EPSG:4326", "EPSG:3857");
            this.view_ol.fit(transformedExtent, this.map_ol.getSize());
        },

        _updateModelCenter: function(){
            var center = ol.proj.toLonLat(this.view_ol.getCenter());
            this._setModelProperty({ center: [center[1], center[0]]});
        },

        _addLayers: function(){
            var self = this;

            var oldLayers = this.layers;
            this.layers = {};

            function findLayerView(layer) {
            var lv = _.find(oldLayers, function(layer_view) {
              var m = layer_view.model;
              return m.isEqual(layer);
            });
            return lv;
            }

            function canReused(layer) {
            return self.map.layers.find(function(m) {
              return m.isEqual(layer);
            });
            }

            // remove all
            for(var layer in oldLayers) {
                var layer_view = oldLayers[layer];
                if (!canReused(layer_view.model)) {
                  layer_view.remove();
                }
            }

            this.map.layers.each(function(lyr) {
                var lv = findLayerView(lyr);
                if (!lv) {
                  self._addLayer(lyr);
                } else {
                  lv.setModel(lyr);
                  self.layers[lyr.cid] = lv;
                  self.trigger('newLayerView', lv, lv.model, self);
                }
              });
        },

        _addLayer: function(layer, layers, opts) {
            var layerView = cdb.geo.OpenLayersMapView.createLayer(layer, this.map_ol);
            if(layerView){
                return this._addLayerToMap(layerView, opts);
            }

            return layerView;
        },

        _addLayerToMap: function(layerView, opts){
            var layer = layerView.model;
            this.layers[layer.cid] = layerView;
            layerView.add();

            for (var i in this.layers) {
                var l = this.layers[i];
                l.layer_ol.setZIndex(l.model.get('order'));
            }

            if(opts === undefined || !opts.silent) {
                this.trigger('newLayerView', layerView, layer, this);
            }

            return layerView;
        },
        
        clean: function(){
            for(var i in this.layers){
                var layerView = this.layers[i];
                layerView.remove();

                delete this.layers[i];
            }

            cdb.core.View.prototype.clean.call(this);
        },
        
        _setZoom: function(model, z) {
            var zoom = z || 1;
            this.view_ol.setZoom(z);

        },
        
        _setCenter: function(model, center){
            this.view_ol.setCenter(ol.proj.fromLonLat([center[1], center[0]]));
        },

        _setView: function(){
            this._setZoom(this.map.get("zoom"));
            this._setCenter(this.map.get("center"));
        },
        pixelToLatLon: function(pos){
            var coordinate = this.map_ol.getCoordinateFromPixel([pos[0], pos[1]]);
            var lonLat = ol.proj.toLonLat(coordinate);
            return {"lat": lonLat[1], "lng": lonLat[0]}; 
        },

        latLonToPixel: function(latlon){
            var pixel = this.map_ol.getPixelFromCoordinate(ol.proj.fromLonLat([latlon[1], latlon[0]]));
            var view = this.map_ol.getView();
            var width = ol.extent.getWidth(view.getProjection().getExtent()) / view.getResolution();
            var pixelX = ((pixel[0] % width) + width) % width;
            var pixelY = pixel[1];
            return { x: pixelX, y: pixelY };
        },

        getBounds: function(){
            var extent = this.view_ol.calculateExtent(this.map_ol.getSize());
            var sw = ol.proj.toLonLat([extent[0], extent[1]]);
            var ne = ol.proj.toLonLat([extent[2], extent[3]]);
            return  [
                    [sw[1], sw[0]], 
                    [ne[1], ne[0]]
                    ];
        },
        setAttribution: function() {
            this._attributionElement.innerHTML = "";

            var attributions = this.map.get('attribution');
            attributions.forEach(function(attribution){
                if(attribution){
                    var item = document.createElement("DIV");
                    item.innerHTML = cdb.core.sanitize.html(attribution);
                    this._attributionElement.appendChild(item);
                }
            }, this);

        },
        getSize: function(){
            var size = this.map_ol.getSize();
            return { x: size[0], y: size[1]};
        },

        panBy: function(p){

        },

        setCursor: function(cursor){
            this.map_ol.getTarget().style.cursor = cursor;
        },

        getNativeMap: function(){
            return this.map_ol;
        },

        invalidateSize: function(){

        }
    },
    {
            layerViewMap: {
                "tiled": cdb.geo.OpenLayersTiledLayerView,
                "layergroup": cdb.geo.OpenLayersCartodbLayerGroupView,
                "namedmap": cdb.geo.OpenLayersCartodbNamedMapView,
                "plain": cdb.geo.OpenLayersPlainLayerView,
                "torque": function(layer, map) { 
                    return new cdb.geo.OpenLayersTorqueLayer(layer,map);
                }
            },

            createLayer: function(layer, opt_map){
                var map = opt_map || this.map_ol;

                var layerViewType = this.layerViewMap[layer.get('type').toLowerCase()];
                var layerView;

                if(layerViewType){
                    layerView = new layerViewType(layer, map);
                }else{
                    cdb.log.error("MAP: " + layer.get('type') + " is not defined");
                }

                return layerView;
            }
    });
})();