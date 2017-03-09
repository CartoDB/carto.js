(function() {
    if (typeof(ol) === "undefined") return;

    cdb.geo.OpenLayersPlainLayerView = function(layerModel, map_ol){
        cdb.geo.OpenLayersBaseLayerView.call(this, layerModel, null, map_ol);
    };

    _.extend(cdb.geo.OpenLayersPlainLayerView.prototype, cdb.geo.OpenLayersBaseLayerView.prototype, 
        {
            add: function(){
                this._update();
            },
            remove: function(){
                var element = this.map_ol.getTargetElement();
                element.style.backgroundImage = undefined;
                element.style.backgroundColor = "#FF000000";
                this._dispose();
            },
            _update: function(){
                var element = this.map_ol.getTargetElement();
                if (this.model.get('color') && this.model.get('color') !== "") {
                    //don't add any layer, just change the background based on the color
                    element.style.backgroundColor = this.model.get('color');
                }
                if (this.model.get('image') && this.model.get('image') !== "") {
                    element.style.backgroundImage = "url(" + this.model.get('image') + ")";
                }
            }
        });
})();