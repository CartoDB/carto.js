describe("LayerDefinition", function() {
  var layerDefinition;
  beforeEach(function(){
    var layer_definition = {
      version: '1.0.0',
      stat_tag: 'vis_id',
      layers: [{
         type: 'cartodb', 
         options: {
           sql: 'select * from ne_10m_populated_places_simple',
           cartocss: '#layer { marker-fill: red; }',
           interactivity: ['test', 'cartodb_id']
         }
       }, {
         type: 'cartodb', 
         options: {
           sql: "select * from european_countries_export",
           cartocss: '#layer { polygon-fill: #000; polygon-opacity: 0.8;}',
           cartocss_version : '2.0.0',
           interactivity: ['       test2    ', 'cartodb_id2']
         }
       }
      ]
    };
    layerDefinition = new LayerDefinition(layer_definition, {
      tiler_domain:   "cartodb.com",
      tiler_port:     "8081",
      tiler_protocol: "http",
      user_name: 'rambo',
      no_cdn: true,
      subdomains: [null]
    });

  });

  it("should return layer count", function() {
    expect(layerDefinition.getLayerCount()).toEqual(2);
  });

  it("should invalidate", function() {
    layerDefinition.layerToken = 'test';
    layerDefinition.urls = ['test'];
    layerDefinition.invalidate();
    expect(layerDefinition.layerToken).toEqual(null);
    expect(layerDefinition.urls).toEqual(null);
    
  });

  it("should remove a layer", function() {
    layerDefinition.removeLayer(0);
    expect(layerDefinition.getLayerCount()).toEqual(1);
    expect(layerDefinition.getLayer(0)).toEqual({
       type: 'cartodb', 
       options: {
         sql: "select * from european_countries_export",
         cartocss: '#layer { polygon-fill: #000; polygon-opacity: 0.8;}',
         cartocss_version: '2.0.0',
         interactivity: ['       test2    ', 'cartodb_id2']
       }
    });
  });

  it("should add a layer", function() {
    layerDefinition.addLayer({ sql : 'b', cartocss: 'b'});
    expect(layerDefinition.getLayerCount()).toEqual(3);
    expect(layerDefinition.getLayer(2)).toEqual({
       type: 'cartodb', 
       options: {
         sql: 'b',
         cartocss: 'b'
       }
    });
    layerDefinition.addLayer({ sql : 'a', cartocss: 'a'}, 0);
    expect(layerDefinition.getLayer(0)).toEqual({
       type: 'cartodb', 
       options: {
         sql: "a",
         cartocss: 'a'
       }
    });
  });

  it("should return json spec of layers", function() {
    expect(layerDefinition.toJSON()).toEqual({
      version: '1.0.0',
      stat_tag: 'vis_id',
      layers: [{
         type: 'cartodb', 
         options: {
           sql: 'select * from ne_10m_populated_places_simple',
           cartocss: '#layer { marker-fill: red; }',
           cartocss_version: '2.1.0',
           interactivity: ['test', 'cartodb_id']
         }
       }, {
         type: 'cartodb', 
         options: {
           sql: "select * from european_countries_export",
           cartocss: '#layer { polygon-fill: #000; polygon-opacity: 0.8;}',
           cartocss_version: '2.0.0',
           interactivity: ['test2', 'cartodb_id2']
         }
       }
      ]
    });
    layerDefinition.getSubLayer(0).hide();
    expect(layerDefinition.toJSON()).toEqual({
      version: '1.0.0',
      stat_tag: 'vis_id',
      layers: [{
         type: 'cartodb', 
         options: {
           sql: "select * from european_countries_export",
           cartocss: '#layer { polygon-fill: #000; polygon-opacity: 0.8;}',
           cartocss_version: '2.0.0',
           interactivity: ['test2', 'cartodb_id2']
         }
       }
      ]
    });
  });

  it("should generate url for tiles", function() {
    var tiles = layerDefinition._layerGroupTiles('test_layer');
    expect(tiles.tiles.length).toEqual(1);
    expect(tiles.grids.length).toEqual(2);
    expect(tiles.grids[0].length).toEqual(1);
    expect(tiles.tiles[0]).toEqual('http://rambo.cartodb.com:8081/api/v1/map/test_layer/{z}/{x}/{y}.png');
    expect(tiles.grids[0][0]).toEqual('http://rambo.cartodb.com:8081/api/v1/map/test_layer/0/{z}/{x}/{y}.grid.json');
    expect(tiles.grids[1][0]).toEqual('http://rambo.cartodb.com:8081/api/v1/map/test_layer/1/{z}/{x}/{y}.grid.json');

  });

  it("should generate url for tiles with params", function() {
    var tiles = layerDefinition._layerGroupTiles('test_layer', {
      api_key: 'api_key_test',
      updated_at: '1234'
    });
    expect(tiles.tiles[0]).toEqual('http://rambo.cartodb.com:8081/api/v1/map/test_layer/{z}/{x}/{y}.png?api_key=api_key_test&updated_at=1234');
    expect(tiles.grids[0][0]).toEqual('http://rambo.cartodb.com:8081/api/v1/map/test_layer/0/{z}/{x}/{y}.grid.json?api_key=api_key_test&updated_at=1234');
  });

  it("should generate url for with cdn", function() {
    layerDefinition.options.no_cdn = false;
    layerDefinition.options.subdomains = ['a', 'b', 'c', 'd'];
    var tiles = layerDefinition._layerGroupTiles('test_layer');
    expect(tiles.tiles[0]).toEqual('http://a.api.cartocdn.com/rambo/api/v1/map/test_layer/{z}/{x}/{y}.png');
    expect(tiles.tiles[1]).toEqual('http://b.api.cartocdn.com/rambo/api/v1/map/test_layer/{z}/{x}/{y}.png');
    expect(tiles.grids[0][0]).toEqual('http://a.api.cartocdn.com/rambo/api/v1/map/test_layer/0/{z}/{x}/{y}.grid.json');
    expect(tiles.grids[0][1]).toEqual('http://b.api.cartocdn.com/rambo/api/v1/map/test_layer/0/{z}/{x}/{y}.grid.json');
  });

  it("grid url should not include interactivity", function() {
    layerDefinition.setInteractivity(0, ['cartodb_id', 'rambo']);
    var tiles = layerDefinition._layerGroupTiles('test_layer');
    expect(tiles.grids[0][0]).toEqual('http://rambo.cartodb.com:8081/api/v1/map/test_layer/0/{z}/{x}/{y}.grid.json');
    expect(tiles.grids[1][0]).toEqual('http://rambo.cartodb.com:8081/api/v1/map/test_layer/1/{z}/{x}/{y}.grid.json');
  });

  it("should set interactivity", function() {
    layerDefinition.setInteractivity(1, ['cartodb_id', 'rambo   ']);
    expect(layerDefinition.getLayer(1).options.interactivity).toEqual(['cartodb_id','rambo']);
    layerDefinition.setInteractivity(['cartodb_id', 'john']);
    expect(layerDefinition.getLayer(0).options.interactivity).toEqual(['cartodb_id', 'john']);
    expect(layerDefinition.toJSON().layers[0].options.interactivity).toEqual(['cartodb_id', 'john']);
  });

  it("should use cdn_url as default", function() {
    delete layerDefinition.options.no_cdn;
    expect(layerDefinition._host()).toEqual('http://api.cartocdn.com/rambo');
    expect(layerDefinition._host('0')).toEqual('http://0.api.cartocdn.com/rambo');
    layerDefinition.options.tiler_protocol = "https";
    expect(layerDefinition._host()).toEqual('https://cartocdn.global.ssl.fastly.net/rambo');
    expect(layerDefinition._host('a')).toEqual('https://a.cartocdn.global.ssl.fastly.net/rambo');
  });

  it("should use cdn_url from tiler when present", function(done) {
    var params;
    delete layerDefinition.options.no_cdn;
    layerDefinition.options.ajax = function(p) { 
      params = p;
      p.success({ layergroupid: 'test', cdn_url: { http: 'cdn.test.com', https:'cdn.testhttps.com' }});
    };

    layerDefinition.getTiles();

    setTimeout(function() {
      expect(layerDefinition._host()).toEqual('http://cdn.test.com/rambo');

      setTimeout(function() {
        layerDefinition.options.tiler_protocol = 'https';
        layerDefinition.getTiles();

        setTimeout(function() {
          expect(layerDefinition._host()).toEqual('https://cdn.testhttps.com/rambo');
          done();
        }, 100)

      }, 200);

    }, 100);
  });

  it("should return null token when there are no layers", function(done) {

      layerDefinition.getSubLayer(0).hide();
      layerDefinition.getSubLayer(1).hide();
      var tk = 'test'
      layerDefinition._getLayerToken(function(a) {
        tk =  a;
      })

      setTimeout(function() {
        expect(tk).toEqual(null);
        done();
      }, 100);
  });

  it("should return values for the latest query", function(done) {
    tokens = [];
    layerDefinition.options.ajax = function(p) { 
      layerDefinition.getLayerToken(function(a) {
        tokens.push(a);
      });
      layerDefinition.options.ajax = function(p) { 
        p.success({ layergroupid: 'test2' });
      }
      p.success({ layergroupid: 'test' });
    };

    layerDefinition.getLayerToken(function(a) {
      tokens.push(a);
    });
    layerDefinition.getLayerToken(function(a) {
      tokens.push(a);
    });

    setTimeout(function() {
      expect(tokens.length).toEqual(3);
      expect(tokens[0]).toEqual(tokens[1]);
      expect(tokens[0]).toEqual(tokens[2]);
      expect(tokens[0].layergroupid).toEqual('test2');
      done();
    }, 1000);
  });


  it("it should use jsonp when request is less than 2kb", function(done) {
    var params;
    layerDefinition.options.ajax = function(p) { 
      params = p;
      p.success({ layergroupid: 'test' });
    };

    layerDefinition._getLayerToken();
    setTimeout(function() {
      expect(params.dataType).toEqual('jsonp');
      done();
    }, 100)
  });

  it("should use not use compression for small layergroups", function(done) {
    layerDefinition.options.cors = false;
    layerDefinition.options.api_key = 'test';
    layerDefinition.options.ajax = function(p) { 
      params = p;
      p.success({ layergroupid: 'test' });
    };

    layerDefinition._getLayerToken();

    setTimeout(function() {
      expect(params.url.indexOf('config') !== -1).toEqual(true);
      done();
    }, 100);
  });

  it("it should include stat_tag", function(done) {
    var params, lzma;
    layerDefinition.options.cors = false;
    layerDefinition.options.ajax = function(p) { 
      params = p;
      p.success({ layergroupid: 'test' });
    };
    layerDefinition.getLayerToken(function() {
    });

    setTimeout(function() {
      expect(params.url.indexOf("stat_tag=vis_id")).not.toEqual(-1)
      done();
    }, 300);

  });

  it("should use jsonp when cors is not available", function(done) {
    var params, lzma;
    layerDefinition.options.cors = false;
    layerDefinition.options.api_key = 'test';
    layerDefinition.options.force_compress = true;
    layerDefinition.options.ajax = function(p) { 
      params = p;
      p.success({ layergroupid: 'test' });
    };

    var json = layerDefinition.toJSON();
    json = JSON.stringify({ config: JSON.stringify(json) });
    LZMA.compress(json, 3, function(encoded) {
      lzma = layerDefinition._array2hex(encoded);
      layerDefinition.getLayerToken(function() {
      });
    });

    setTimeout(function() {
      expect(params.url).toEqual(layerDefinition._tilerHost() + '/api/v1/map?map_key=test&stat_tag=vis_id&lzma=' + encodeURIComponent(lzma));
      done();
    }, 600);
  });

  it("should add api_key", function() {
    var url = null;
    layerDefinition.options.cors = true;
    layerDefinition.options.compressor = function(data, level, call) {
      call("config=" + data);
    }
    layerDefinition.options.ajax = function(p) { 
      url = p.url;
      p.success({ layergroupid: 'test' });
    };

    layerDefinition.options.api_key = 'key';
    layerDefinition._getLayerToken();
    expect(url.indexOf('map_key=key')).not.toEqual(-1);

    layerDefinition.options.map_key = 'key2';
    delete layerDefinition.options.api_key
    layerDefinition._getLayerToken();
    expect(url.indexOf('map_key=key2')).not.toEqual(-1);


    delete layerDefinition.options.map_key
    layerDefinition.options.extra_params = {}
    layerDefinition.options.extra_params.map_key = 'key4';
    layerDefinition._getLayerToken();
    expect(url.indexOf('map_key=key4')).not.toEqual(-1);

    layerDefinition.options.extra_params = {}
    layerDefinition.options.extra_params.api_key = 'key4';
    layerDefinition._getLayerToken();
    expect(url.indexOf('map_key=key4')).not.toEqual(-1);
  });


  it("getTiles should include extra params", function() {
    layerDefinition.options.extra_params = {
      'map_key': 'testapikey',
      'should_not': 'included'
    }
    layerDefinition.layerToken = 'test';
    layerDefinition.getTiles(function(tiles) {
      expect(tiles.tiles[0].indexOf('map_key=testapikey')).not.toEqual(-1)
      expect(tiles.tiles[0].indexOf('should_not')).toEqual(-1)
    });
  });

  it("getTiles should use empty gif there there is no layers", function(done) {
      layerDefinition.getSubLayer(0).hide();
      layerDefinition.getSubLayer(1).hide();
      layerDefinition.getLayerToken = function (callback) {
        callback(null);
      }

      layerDefinition.getTiles(function(t) {
        urls = t;
      })

      setTimeout(function() {
        expect(urls.tiles[0]).toEqual(Map.EMPTY_GIF);
        done();
      }, 100)
  });

  it("should set refresh timer after being updated", function(done) {
    layerDefinition.options.refreshTime = 10;
    layerDefinition.options.ajax = function(p) { 
      params = p;
      p.success({ layergroupid: 'test' });
    };

    layerDefinition.getTiles(function(tiles) {});

    spyOn(layerDefinition,'invalidate');

    setTimeout(function() {
      expect(layerDefinition.invalidate).toHaveBeenCalled();
      done();
    }, 200);

  });

  it("should manage layer index with hidden layers", function() {
    expect(layerDefinition.getLayerNumberByIndex(0)).toEqual(0);
    expect(layerDefinition.getLayerNumberByIndex(1)).toEqual(1);

    expect(layerDefinition.getLayerIndexByNumber(0)).toEqual(0);
    expect(layerDefinition.getLayerIndexByNumber(1)).toEqual(1);

    layerDefinition.getSubLayer(0).hide();
    expect(layerDefinition.getLayerNumberByIndex(0)).toEqual(1);
    expect(layerDefinition.getLayerNumberByIndex(1)).toEqual(-1);

    expect(layerDefinition.getLayerIndexByNumber(1)).toEqual(0);
  }),

  describe("sublayers", function() {

    it("should create sublayer", function() {
      var subLayer = layerDefinition.createSubLayer({
        sql: 'select * from table',
        cartocss: 'test',
        interactivity: 'test'
      });
      expect(!!subLayer).toEqual(true);
    });

    it("should get cartocss and sql", function() {
      var layer = layerDefinition.getSubLayer(0);
      expect(layer.getSQL()).toEqual('select * from ne_10m_populated_places_simple');
      expect(layer.getCartoCSS()).toEqual('#layer { marker-fill: red; }');
    });

    it("should set sql and cartocss by name", function() {
      var q;
      var layer = layerDefinition.getSubLayer(0);
      layer.setSQL(q='select * from rambisimo');
      expect(layerDefinition.toJSON().layers[0].options.sql).toEqual(q);
      layer.setCartoCSS(q='cartocss');
      expect(layerDefinition.toJSON().layers[0].options.cartocss).toEqual(q);
    });

    it("should get sublayer count", function() {
      expect(layerDefinition.getSubLayerCount()).toEqual(2);
      var sub = layerDefinition.createSubLayer({
        sql: 'select * from table',
        cartocss: 'test',
        interactivity: 'test'
      });
      expect(layerDefinition.getSubLayerCount()).toEqual(3);
      sub.remove();
      expect(layerDefinition.getSubLayerCount()).toEqual(2);
    });

    it("should show/hide", function() {
      layerDefinition.getSubLayer(0).hide();
      expect(layerDefinition.toJSON().layers.length).toEqual(1);
      expect(layerDefinition.getSubLayer(0).get('hidden')).toEqual(true);
      expect(layerDefinition.getSubLayerCount()).toEqual(2);
      layerDefinition.getSubLayer(0).show();
      expect(layerDefinition.getSubLayer(0).get('hidden')).toEqual(false);
      expect(layerDefinition.toJSON().layers.length).toEqual(2);
      expect(layerDefinition.getSubLayerCount()).toEqual(2);
    });

    it("should toggle the visibility", function() {
      layerDefinition.getSubLayer(0).hide();
      var visibility = layerDefinition.getSubLayer(0).toggle();

      expect(visibility).toEqual(true);
      expect(layerDefinition.getSubLayer(0).get('hidden')).toEqual(false);
      expect(layerDefinition.toJSON().layers.length).toEqual(2);
      expect(layerDefinition.getSubLayerCount()).toEqual(2);

      visibility = layerDefinition.getSubLayer(0).toggle();

      expect(visibility).toEqual(false);
      expect(layerDefinition.getSubLayer(0).get('hidden')).toEqual(true);
      expect(layerDefinition.toJSON().layers.length).toEqual(1);
      expect(layerDefinition.getSubLayerCount()).toEqual(2);
    });

    it("hide should remove interaction", function() {
      var interaction =  layerDefinition.interactionEnabled = {}
      layerDefinition.setInteraction = function(layer, value) {
        layerDefinition.interactionEnabled[layer] = value;
      };
      layerDefinition.getSubLayer(0).setInteraction(true);
      expect(interaction[0]).toEqual(true);
      layerDefinition.getSubLayer(0).hide();
      expect(interaction[0]).toEqual(false);
      layerDefinition.getSubLayer(0).show();
      expect(interaction[0]).toEqual(true);
      layerDefinition.getSubLayer(1).hide();
      layerDefinition.getSubLayer(1).show();
      expect(interaction[1]).toEqual(undefined);

    })

    it("should be the same object for the same sublayer", function() {
      expect(layerDefinition.getSubLayer(0)).toBe(layerDefinition.getSubLayer(0));
    });



    it("should raise an exception when change something after remove", function() {
      var sub = layerDefinition.getSubLayer(0);
      sub.remove();
      var a = false;
      try {
        sub.setSQL('test');
      } catch(e) {
        a = true;
      }
      expect(a).toEqual(true);

    });


    it("should set sql by GET", function(done) {
      var q;
      var layer = layerDefinition.getSubLayer(0);

      spyOn(layerDefinition, '_requestGET').and.callThrough();
      spyOn(layerDefinition, '_requestPOST').and.callThrough();

      var query = "SELECT * FROM RAMBO_CHARLIES where area < 1000";
      layer.setSQL(q=query);
      layerDefinition.getLayerToken();

      setTimeout(function(){
        expect(layerDefinition._requestGET).toHaveBeenCalled();
        expect(layerDefinition._requestPOST).not.toHaveBeenCalled();
        done();
      }, 100);
    });

    it("should set sql by POST", function(done) {
      var q;
      var layer = layerDefinition.getSubLayer(0);

      spyOn(layerDefinition, '_requestGET').and.callThrough();
      spyOn(layerDefinition, '_requestPOST').and.callThrough();

      var query = "select 1 ";
      for (var i = 0; i < 1600; i++){
        query += ", " + Math.floor(Math.random() * 100) + 1;
      }
      query += ', * from rambo_charlies where area > 10';
      layer.setSQL(q=query);
      layerDefinition.getLayerToken();

      setTimeout(function(){
        expect(layerDefinition._requestGET).not.toHaveBeenCalled();
        expect(layerDefinition._requestPOST).toHaveBeenCalled();
        done();
      }, 100);
    });

  });

  describe('layerDefFromSubLayers', function() {
    it("should generate layerdef", function() {
      var layerDef = LayerDefinition.layerDefFromSubLayers([{
        sql: 'test',
        cartocss:'test'
      }]);

      expect(layerDef).toEqual({
          version: '1.0.0',
          stat_tag: 'API',
          layers: [{
            type: 'cartodb',
            options: {
              sql: 'test',
              cartocss:'test'
            }
          }]
      });

    });
  });

});

describe("NamedMap", function() {
  var namedMap, named_map;

  beforeEach(function() {
    named_map = {
      name: 'testing',
      params: {
        color: 'red'
      },
      layers: [{
          infowindow: {
            fields: [ { title:'test', value:true, position:0, index:0 } ]
          }
      }]
    };
    namedMap= new NamedMap(named_map, {
      tiler_domain:   "cartodb.com",
      tiler_port:     "8081",
      tiler_protocol: "http",
      user_name: 'rambo',
      no_cdn: true,
      subdomains: [null]
    });
  });

  it("should include instanciation callback", function(done) {
    namedMap = new NamedMap(named_map, {
      tiler_domain:   "cartodb.com",
      tiler_port:     "8081",
      tiler_protocol: "https",
      user_name: 'rambo',
      no_cdn: true,
      subdomains: [null],
      instanciateCallback: 'testing'

    });
    namedMap.options.ajax = function(p) { 
      params = p;
      p.success({ layergroupid: 'test' });
    };

    namedMap._getLayerToken();
    namedMap.getTiles(function(t) {
      tiles = t;
    });

    setTimeout(function() {
      expect(params.jsonpCallback).toEqual('testing');
      expect(params.cache).toEqual(true);
      done();
    }, 100);
  })

  it("should instance named_map with no layers", function(done) {
    var named_map = {
      name: 'testing'
    };
    var nm = new NamedMap(named_map, {
      tiler_domain:   "cartodb.com",
      tiler_port:     "8081",
      tiler_protocol: "http",
      user_name: 'rambo',
      no_cdn: true,
      subdomains: [null]
    });
    var params;
    nm.options.ajax = function(p) { 
      params = p;
      p.success({ layergroupid: 'test' });
    };

    nm._getLayerToken();

    setTimeout(function() {
      expect(params.dataType).toEqual('jsonp');
      done();
    }, 100);
  });

  it("should instance named_map", function(done) {
    var params;
    namedMap.options.ajax = function(p) { 
      params = p;
      p.success({ layergroupid: 'test' });
    };

    namedMap._getLayerToken();

    setTimeout(function() {
      expect(params.dataType).toEqual('jsonp');
      expect(params.url).toEqual('http://rambo.cartodb.com:8081/api/v1/map/named/testing/jsonp?config=' + encodeURIComponent(JSON.stringify({ color: 'red', layer0: 1})));
      done();
    }, 100);
  });

  it("should instance named_map using POST", function(done) {
    var params;
    namedMap.options.cors = true;
    namedMap.options.force_cors =true;
    namedMap.options.ajax = function(p) { 
      params = p;
      p.success({ layergroupid: 'test' });
    };

    namedMap._getLayerToken();

    setTimeout(function() {
      expect(params.type).toEqual('POST');
      expect(params.dataType).toEqual('json');
      expect(params.url).toEqual('http://rambo.cartodb.com:8081/api/v1/map/named/testing')
      expect(params.data).toEqual(JSON.stringify({color: 'red', layer0: 1}));
      done();
    }, 100);
  });

  it("shoud have infowindow", function() {
    expect(namedMap.containInfowindow()).toEqual(true);
  });

  it("should fetch attributes", function() {
    namedMap.layerToken = 'test';
    namedMap._layerGroupTiles
    namedMap.options.ajax = function(p) { 
      params = p;
      p.success({ test: 1 });
    };
    namedMap.fetchAttributes(1, 12345, null, function(data) {
      expect(data).toEqual({test: 1});
      expect(params.url).toEqual('http://rambo.cartodb.com:8081/api/v1/map/test/1/attributes/12345')
      expect(params.dataType).toEqual('jsonp')
      expect(params.cache).toEqual(true);
      expect(params.jsonpCallback.indexOf('_cdbi_layer_attributes') !== -1).toEqual(true);
    });
    namedMap.options.tiler_protocol = 'https';
    namedMap.setAuthToken('test');
    namedMap.layerToken = 'test';
    namedMap.fetchAttributes(1, 12345, null, function(data) {
      expect(data).toEqual({test: 1});
      expect(params.url).toEqual('https://rambo.cartodb.com:8081/api/v1/map/test/1/attributes/12345?auth_token=test')
      expect(params.dataType).toEqual('jsonp');
      expect(params.cache).toEqual(true);
      expect(params.jsonpCallback.indexOf('_cdbi_layer_attributes') !== -1).toEqual(true);
    });

  })

  it("should enable/disable layers", function(done) {
    var params;
    namedMap.layers.push({
      options:  {},
        infowindow: {
          fields: [ { title:'test', value:true, position:0, index:0 } ]
        }
    });
    namedMap.options.ajax = function(p) { 
      params = p;
      p.success({ layergroupid: 'test' });
    };

    namedMap.getSubLayer(0).hide();
    namedMap._getLayerToken();

    setTimeout(function() {
      var config ="config=" + encodeURIComponent(JSON.stringify({color: 'red', layer0: 0, layer1: 1}));
      expect(params.url.indexOf(config)).not.toEqual(-1);

      var token = 'test';

      setTimeout(function() {
        namedMap.getSubLayer(1).hide();
        namedMap._getLayerToken(function(d) {
          token = d;
        });

        expect(token).not.toEqual(null);

        setTimeout(function() {
          namedMap.getSubLayer(0).show();
          namedMap._getLayerToken();

          setTimeout(function() {
            var config ="config=" + encodeURIComponent(JSON.stringify({color: 'red', layer0: 1, layer1: 0}));
            expect(params.url.indexOf(config)).not.toEqual(-1);
            done();
          }, 200);

        }, 100);

      }, 100);

    }, 100);
  });

  it("should raise errors when try to set sql or cartocss", function() {
    expect(function() { namedMap.setCartoCSS('test') }).toThrow(new Error("cartocss is read-only in NamedMaps"));
    expect(function() { namedMap.setSQL('sql') }).toThrow(new Error("SQL is read-only in NamedMaps"));

    expect(function() {
      namedMap.getSubLayer(0).set({ 'sql':'test', })
    }).toThrow(new Error("sql is read-only in NamedMaps"));

    expect(function() {
      namedMap.getSubLayer(0).set({ interactivity: 'test1' });
    }).toThrow(new Error("interactivity is read-only in NamedMaps"));

    expect(function() {
      namedMap.getSubLayer(0).setInteractivity('test1');
    }).toThrow(new Error("interactivity is read-only in NamedMaps"));

    expect(function() {
      namedMap.getSubLayer(0).set({ 'hidden': 1 });
    }).not.toThrow();

    expect(function() {
      namedMap.getSubLayer(0).remove();
    }).toThrow(new Error("sublayers are read-only in Named Maps"));
    expect(function() {
      namedMap.createSubLayer();
    }).toThrow(new Error("sublayers are read-only in Named Maps"));
    expect(function() {
      namedMap.addLayer();
    }).toThrow(new Error("sublayers are read-only in Named Maps"));
  });

  it("should raise errors when try to get sql or cartocss", function() {
    expect(function() { namedMap.getCartoCSS('test') }).toThrow(new Error("cartocss can't be accessed in NamedMaps"));
    expect(function() { namedMap.getSQL('sql') }).toThrow(new Error("SQL can't be accessed in NamedMaps"));
  })

  it("should send auth_token when it's provided", function(done) {
    var tiles;
    var named_map = {
      name: 'testing',
      auth_token: 'auth_token_test',
      params: {
        color: 'red'
      },
      layers: [{}]
    };
    namedMap = new NamedMap(named_map, {
      tiler_domain:   "cartodb.com",
      tiler_port:     "8081",
      tiler_protocol: "https",
      user_name: 'rambo',
      no_cdn: true,
      subdomains: [null]
    });
    namedMap.options.ajax = function(p) { 
      params = p;
      p.success({ layergroupid: 'test' });
    };

    namedMap._getLayerToken();
    namedMap.getTiles(function(t) {
      tiles = t;
    });

    setTimeout(function() {
      expect(params.url.indexOf('auth_token=auth_token_test')).not.toEqual(-1);
      expect(tiles.tiles[0].indexOf('auth_token=auth_token_test')).not.toEqual(-1);
      expect(tiles.grids[0][0].indexOf('auth_token=auth_token_test')).not.toEqual(-1);

      namedMap.setAuthToken('test2');
      namedMap._getLayerToken();

      setTimeout(function() {
        expect(params.url.indexOf('auth_token=test2')).not.toEqual(-1);

        setTimeout(function() {
          namedMap.setAuthToken(['token1', 'token2']);
          namedMap._getLayerToken();
          namedMap.getTiles(function(t) {
            tiles = t;
          });

          setTimeout(function() {
            expect(params.url.indexOf('auth_token[]=token1')).not.toEqual(-1);
            expect(tiles.tiles[0].indexOf('auth_token[]=token1')).not.toEqual(-1);
            expect(tiles.grids[0][0].indexOf('auth_token[]=token1')).not.toEqual(-1);
            done();
          }, 100);

        }, 100);

      }, 100);

    }, 100);
  });

  it("set param without default param", function(done) {
    var named_map = {
      stat_tag: 'stat_tag_named_map',
      name: 'testing',
      auth_token: 'auth_token_test',
      layers: [{}]
    };
    namedMap = new NamedMap(named_map, {
      tiler_domain:   "cartodb.com",
      tiler_port:     "8081",
      tiler_protocol: "https",
      user_name: 'rambo',
      no_cdn: true,
      subdomains: [null]
    });
    namedMap.options.ajax = function(p) { 
      params = p;
      p.success({ layergroupid: 'test' });
    };
    namedMap.setParams('color', 'red');
    namedMap._getLayerToken();

    setTimeout(function() {
      var config = "config=" + encodeURIComponent(JSON.stringify({color: 'red', layer0: 1}));
      expect(params.url.indexOf(config)).not.toEqual(-1);
      console.log(params.url);
      expect(params.url.indexOf("stat_tag=stat_tag_named_map")).not.toEqual(-1);
      done();
    }, 100);
  });

  it("should add params", function(done) {
    var params;
    namedMap.options.ajax = function(p) { 
      params = p;
      p.success({ layergroupid: 'test' });
    };
    namedMap.named_map.params = { color: 'red' }
    spyOn(namedMap,'onLayerDefinitionUpdated');
    namedMap.setParams('test', 10);

    expect(namedMap.onLayerDefinitionUpdated).toHaveBeenCalled();

    namedMap._getLayerToken();

    setTimeout(function() {
      var config ="config=" + encodeURIComponent(JSON.stringify({color: 'red', test: 10, layer0: 1}));
      console.log(params.url);
      expect(params.url.indexOf(config)).not.toEqual(-1);

      setTimeout(function() {
        namedMap.setParams('color', null);
        namedMap._getLayerToken();

        setTimeout(function() {
          var config ="config=" + encodeURIComponent(JSON.stringify({ test: 10, layer0: 1}));
          console.log(params.url);
          expect(params.url.indexOf(config)).not.toEqual(-1);
          done();
        }, 100);

      }, 100);

    }, 100);
  });

  it("should use https when auth_token is provided", function() {
    var named_map = {
      name: 'testing',
      auth_token: 'auth_token_test',
    };
    try {
      namedMap = new NamedMap(named_map, {
        tiler_domain:   "cartodb.com",
        tiler_port:     "8081",
        tiler_protocol: "http",
        user_name: 'rambo',
        no_cdn: true,
        subdomains: [null]
      });
      expect(0).toBe(1);
    } catch(e) {
      expect(e.message).toEqual("https must be used when auth_token is set");
    }
  });

  it("should return layer by index", function() {
    expect(namedMap.getLayerIndexByNumber(0)).toEqual(0);
    expect(namedMap.getLayerIndexByNumber(1)).toEqual(1);
  });


  it("should throw an error message when there is an error with the namedmaps", function(done) {

    var named_map = {
      stat_tag: 'stat_tag_named_map',
      name: 'testing',
      auth_token: 'auth_token_test'
    };

    namedMap = new NamedMap(named_map, {
      tiler_domain:   "cartodb.com",
      tiler_port:     "8081",
      tiler_protocol: "https",
      user_name: 'rambo',
      no_cdn: true,
      subdomains: [null]
    });

    namedMap.options.ajax = function(p) { 
      params = p;
      p.success({ error: 'not found' });
    };

    var _data, _error;
    var callb = function (dt,er){
      _data = dt;
      _error = er;
    };

    namedMap.getTiles(callb);

    setTimeout(function() {
      var res = "not found";

      expect(_error).toEqual(res);
      expect(true).toEqual(true);

      done();
    }, 100);

  });


});

