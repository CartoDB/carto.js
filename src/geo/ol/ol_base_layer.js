(function() {
    if (typeof(ol) === "undefined") return;

    cdb.geo.OpenLayersBaseLayerView = function(layerModel, layer_ol, map_ol){
        this.map_ol = map_ol;
        this.setModel(layerModel);
        this.layer_ol = layer_ol;
        this.layer_ol.set('layerview', this);
 
        this.type = layerModel.get('type').toLowerCase();
    };

    _.extend(cdb.geo.OpenLayersBaseLayerView.prototype, Backbone.Events);
    _.extend(cdb.geo.OpenLayersBaseLayerView.prototype, {
        setModel: function(model){
            if(this.model){
                this.model.unbind('change', this._update);
            }
            this.model = model;
            this.model.bind('change', this._update, this);
        },
        getAttribution: function() {
            return cdb.core.sanitize.html(this.model.get('attribution'));
        },
        add: function(){
            this.map_ol.addLayer(this.layer_ol);
            this.trigger('added');
        },

        remove: function(){
            this.map_ol.removeLayer(this.layer_ol);
            this.trigger('remove', this);
        },

        dispose: function(){
            this.map_ol = undefined;
            this.layer_ol = undefined;
            this.model.unbind(null, null, null);
            this.unbind();
        }
    });

})();