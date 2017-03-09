(function() {
    if (typeof(ol) === "undefined") return;

/** Tile Layer View Implementation **/
    cdb.geo.OpenLayersTiledLayerView = function(layerModel, map_ol){
        var tileSize = 256;

        if(layerModel.get('tileSize')){
            tileSize = layerModel.get('tileSize');
        }
   
        this._source = new ol.source.XYZ({
            tileSize: [tileSize, tileSize],
            url: this._getUrlTemplate(layerModel),
            maxZoom: layerModel.get('maxZoom'),
            minZoom: layerModel.get('minZoom')
        });
        
        cdb.geo.OpenLayersBaseLayerView.call(this, layerModel, new ol.layer.Tile({
            source : this._source
        }), map_ol); 
    };
  
    _.extend(cdb.geo.OpenLayersTiledLayerView.prototype, cdb.geo.OpenLayersBaseLayerView.prototype, {
        add: function(){
            var layers = this.map_ol.getLayers();
            layers.insertAt(0, this.layer_ol);
        },
        _update : function(){
            this._source.setUrl(this._getUrlTemplate(this.model));
        },
        _getUrlTemplate: function(layerModel){
            var subdomains = layerModel.get('subdomains');
            var urlTemplate = layerModel.get('urlTemplate');

            if(subdomains && subdomains !== ""){
                urlTemplate = urlTemplate.replace("{s}", "{" + subdomains.charAt(0) + "-" +  subdomains.charAt(subdomains.length-1) + "}"); 
            }
            return urlTemplate;
        }
    });
})();
