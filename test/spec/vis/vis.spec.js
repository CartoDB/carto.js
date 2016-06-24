var $ = require('jquery');
var _ = require('underscore');
var Vis = require('../../../src/vis/vis');
var VizJSON = require('../../../src/api/vizjson');

var fakeVizJSON = function () {
  return {
    'id': '03a89434-379e-11e6-b2e3-0e674067d321',
    'version': '3.0.0',
    'title': 'Untitled Map 6',
    'likes': 0,
    'description': null,
    'scrollwheel': false,
    'legends': true,
    'map_provider': 'leaflet',
    'bounds': [
      [
        -37.814,
        -123.11934
      ],
      [
        64,
        153.02809
      ]
    ],
    'center': '[13.093,14.954374999999999]',
    'zoom': 1,
    'updated_at': '2016-06-22T14:25:00+00:00',
    'layers': [
      {
        'options': {
          'default': 'true',
          'url': 'http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
          'subdomains': 'abcd',
          'minZoom': '0',
          'maxZoom': '18',
          'name': 'Positron',
          'className': 'positron_rainbow_labels',
          'attribution': '&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors &copy; <a href=\"http://cartodb.com/attributions\">CartoDB</a>',
          'labels': {
            'url': 'http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png'
          },
          'urlTemplate': 'http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png'
        },
        'infowindow': null,
        'tooltip': null,
        'id': 'bd329548-dfdf-4d05-95f5-4773d041b91d',
        'order': 0,
        'type': 'tiled'
      },
      {
        'type': 'layergroup',
        'options': {
          'user_name': 'pabloalonso',
          'maps_api_template': 'https://{user}.cartodb.com:443',
          'sql_api_template': 'https://{user}.cartodb.com:443',
          'filter': 'mapnik',
          'layer_definition': {
            'stat_tag': '03a89434-379e-11e6-b2e3-0e674067d321',
            'version': '3.0.0',
            'layers': [
              {
                'id': 'aefb9966-e587-40dc-8be7-6e85949f8ebe',
                'type': 'CartoDB',
                'infowindow': {
                  'fields': [
                    {
                      'name': 'gnip',
                      'title': true,
                      'position': 0
                    },
                    {
                      'name': 'actor_disp',
                      'title': true,
                      'position': 1
                    }
                  ],
                  'template_name': 'table/views/infowindow_light',
                  'template': '<div class=\"CDB-infowindow CDB-infowindow--light js-infowindow\">\n  <div class=\"CDB-infowindow-close js-close\"></div>\n  <div class=\"CDB-infowindow-container\">\n    <div class=\"CDB-infowindow-bg\">\n      <div class=\"CDB-infowindow-inner\">\n        {{#loading}}\n          <div class=\"CDB-Loader js-loader is-visible\"></div>\n        {{/loading}}\n        <ul class=\"CDB-infowindow-list js-content\">\n          {{#content.fields}}\n          <li class=\"CDB-infowindow-listItem\">\n            {{#title}}<h5 class=\"CDB-infowindow-subtitle\">{{title}}</h5>{{/title}}\n            {{#value}}<h4 class=\"CDB-infowindow-title\">{{{ value }}}</h4>{{/value}}\n            {{^value}}<h4 class=\"CDB-infowindow-title\">null</h4>{{/value}}\n          </li>\n          {{/content.fields}}\n        </ul>\n      </div>\n    </div>\n    <div class=\"CDB-hook\">\n      <div class=\"CDB-hook-inner\"></div>\n    </div>\n  </div>\n</div>\n',
                  'alternative_names': {},
                  'width': 226,
                  'maxHeight': 180
                },
                'tooltip': {
                  'fields': [],
                  'template_name': 'tooltip_light',
                  'template': '<div class=\"CDB-Tooltip CDB-Tooltip--isLight\">\n  <ul class=\"CDB-Tooltip-list\">\n    {{#fields}}\n      <li class=\"CDB-Tooltip-listItem\">\n        {{#title}}\n          <h3 class=\"CDB-Tooltip-listTitle\">{{{ title }}}</h3>\n        {{/title}}\n        <h4 class=\"CDB-Tooltip-listText\">{{{ value }}}</h4>\n      </li>\n    {{/fields}}\n  </ul>\n</div>\n',
                  'alternative_names': {},
                  'maxHeight': 180
                },
                'legend': {
                  'type': 'none',
                  'show_title': false,
                  'title': '',
                  'template': '',
                  'visible': true
                },
                'order': 1,
                'visible': true,
                'options': {
                  'layer_name': 'twitter_t3chfest_reduced',
                  'cartocss': '/** simple visualization */\n\n#twitter_t3chfest_reduced{\n  marker-fill-opacity: 0.9;\n  marker-line-color: #FFF;\n  marker-line-width: 1;\n  marker-line-opacity: 1;\n  marker-placement: point;\n  marker-type: ellipse;\n  marker-width: 10;\n  marker-fill: #FF6600;\n  marker-allow-overlap: true;\n}',
                  'cartocss_version': '2.1.1',
                  'interactivity': 'cartodb_id',
                  'source': 'a0'
                }
              }
            ]
          },
          'attribution': ''
        }
      },
      {
        'options': {
          'default': 'true',
          'url': 'http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
          'subdomains': 'abcd',
          'minZoom': '0',
          'maxZoom': '18',
          'attribution': '&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors &copy; <a href=\"http://cartodb.com/attributions\">CartoDB</a>',
          'urlTemplate': 'http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
          'type': 'Tiled',
          'name': 'Positron Labels'
        },
        'infowindow': null,
        'tooltip': null,
        'id': '2a0b6f3a-e11c-4ff8-b3d3-65366935341a',
        'order': 2,
        'type': 'tiled'
      }
    ],
    'overlays': [
      {
        'type': 'share',
        'order': 2,
        'options': {
          'display': true,
          'x': 20,
          'y': 20
        },
        'template': ''
      },
      {
        'type': 'search',
        'order': 3,
        'options': {
          'display': true,
          'x': 60,
          'y': 20
        },
        'template': ''
      },
      {
        'type': 'zoom',
        'order': 6,
        'options': {
          'display': true,
          'x': 20,
          'y': 20
        },
        'template': '<a href=\"#zoom_in\" class=\"zoom_in\">+</a> <a href=\"#zoom_out\" class=\"zoom_out\">-</a>'
      },
      {
        'type': 'loader',
        'order': 8,
        'options': {
          'display': true,
          'x': 20,
          'y': 150
        },
        'template': '<div class=\"loader\" original-title=\"\"></div>'
      },
      {
        'type': 'logo',
        'order': 9,
        'options': {
          'display': true,
          'x': 10,
          'y': 40
        },
        'template': ''
      }
    ],
    'prev': null,
    'next': null,
    'transition_options': {
      'time': 0
    },
    'widgets': [],
    'datasource': {
      'user_name': 'pabloalonso',
      'maps_api_template': 'https://{user}.cartodb.com:443',
      'stat_tag': '03a89434-379e-11e6-b2e3-0e674067d321'
    },
    'user': {
      'fullname': 'Pablo',
      'avatar_url': '//cartodb-libs.global.ssl.fastly.net/cartodbui/assets/unversioned/images/avatars/avatar_planet_green.png'
    },
    'analyses': [
      {
        'id': 'a0',
        'type': 'source',
        'params': {
          'query': 'SELECT * FROM twitter_t3chfest_reduced limit 1'
        },
        'options': {
          'table_name': 'twitter_t3chfest_reduced'
        }
      }
    ],
    'vector': false
  };
};

describe('vis/vis', function () {
  beforeEach(function () {
    this.vis = new Vis();
  });

  it('.trackLoadingObject .untrackLoadingObject and .clearLoadingObjects should change the loading attribute', function () {
    var object = { id: 'id' };

    // 'loading' is false by default
    expect(this.vis.get('loading')).toEqual(false);

    this.vis.trackLoadingObject(object);

    // an object is being loaded so 'loading' is true
    expect(this.vis.get('loading')).toEqual(true);

    this.vis.untrackLoadingObject(object);

    // no objects are being loaded again so 'loading' is false
    expect(this.vis.get('loading')).toEqual(false);
  });

  describe('.load', function () {
    beforeEach(function () {
      this.vis.load(new VizJSON(fakeVizJSON()), {});
    });

    it('should correctly set some public properties', function () {
      expect(this.vis.map).toBeDefined();
      expect(this.vis.analysis).toBeDefined();
      expect(this.vis.dataviews).toBeDefined();
      expect(this.vis.layerGroupModel).toBeDefined();
      expect(this.vis.overlaysCollection).toBeDefined();
    });

    it('should load the layers', function () {
      expect(this.vis.map.layers.size()).toEqual(3);
    });

    it('should use given maxZoom and minZoom', function () {
      var vizjson = fakeVizJSON();
      vizjson.maxZoom = 10;
      vizjson.minZoom = 5;

      this.vis.load(new VizJSON(vizjson));

      expect(this.vis.map.get('maxZoom')).toEqual(10);
      expect(this.vis.map.get('minZoom')).toEqual(5);
    });

    it('should use the given provider', function () {
      var vizjson = fakeVizJSON();
      vizjson.map_provider = 'googlemaps';

      this.vis.load(new VizJSON(vizjson));

      expect(this.vis.map.get('provider')).toEqual('googlemaps');
    });

    describe('dragging option', function () {
      beforeEach(function () {
        this.vizjson = {
          updated_at: 'cachebuster',
          title: 'irrelevant',
          description: 'not so irrelevant',
          url: 'http://cartodb.com',
          center: [40.044, -101.95],
          zoom: 4,
          bounds: [[1, 2], [3, 4]],
          scrollwheel: true,
          overlays: [],
          user: {
            fullname: 'Chuck Norris',
            avatar_url: 'http://example.com/avatar.jpg'
          },
          datasource: {
            user_name: 'wadus',
            maps_api_template: 'https://{user}.example.com:443',
            stat_tag: 'ece6faac-7271-11e5-a85f-04013fc66a01',
            force_cors: true // This is sometimes set in the editor
          }
        };
      });

      it('should be enabled with zoom overlay and scrollwheel enabled', function () {
        this.vizjson.overlays = [
          {
            type: 'zoom',
            order: 6,
            options: {
              x: 20,
              y: 20,
              display: true
            },
            template: ''
          }
        ];

        this.vis.load(new VizJSON(this.vizjson));
        expect(this.vis.map.get('drag')).toBeTruthy();
      });

      it('should be enabled with zoom overlay and scrollwheel disabled', function () {
        this.vizjson.overlays = [
          {
            type: 'zoom',
            order: 6,
            options: {
              x: 20,
              y: 20,
              display: true
            },
            template: ''
          }
        ];

        this.vis.load(new VizJSON(this.vizjson));
        expect(this.vis.map.get('drag')).toBeTruthy();
      });

      it('should be enabled without zoom overlay and scrollwheel enabled', function () {
        this.vizjson.scrollwheel = true;

        this.vis.load(new VizJSON(this.vizjson));
        expect(this.vis.map.get('drag')).toBeTruthy();
      });

      it('should be disabled without zoom overlay and scrollwheel disabled', function () {
        this.vizjson.scrollwheel = false;

        this.vis.load(new VizJSON(this.vizjson));
        expect(this.vis.map.get('drag')).toBeFalsy();
      });
    });

    it('when https is false all the urls should be transformed to http', function () {
      var vizjson = fakeVizJSON();

      vizjson.layers = [{
        type: 'tiled',
        options: {
          urlTemplate: 'https://dnv9my2eseobd.cloudfront.net/v3/{z}/{x}/{y}.png'
        }
      }];

      this.vis.set('https', false);
      this.vis.load(new VizJSON(vizjson));

      expect(this.vis.map.layers.at(0).get('urlTemplate')).toEqual(
        'http://a.tiles.mapbox.com/v3/{z}/{x}/{y}.png'
      );
    });

    it('when https is true all urls should NOT be transformed to http', function () {
      var vizjson = fakeVizJSON();

      vizjson.layers = [{
        type: 'tiled',
        options: {
          urlTemplate: 'https://dnv9my2eseobd.cloudfront.net/v3/{z}/{x}/{y}.png'
        }
      }];

      this.vis.set('https', true);
      this.vis.load(new VizJSON(vizjson));

      expect(this.vis.map.layers.at(0).get('urlTemplate')).toEqual(
        'https://dnv9my2eseobd.cloudfront.net/v3/{z}/{x}/{y}.png'
      );
    });

    it('should initialize existing analyses', function () {
      this.vizjson = {
        layers: [
          {
            type: 'tiled',
            options: {
              urlTemplate: ''
            }
          },
          {
            type: 'layergroup',
            options: {
              user_name: 'pablo',
              maps_api_template: 'https://{user}.cartodb-staging.com:443',
              layer_definition: {
                stat_tag: 'ece6faac-7271-11e5-a85f-04013fc66a01',
                layers: [{
                  type: 'CartoDB',
                  options: {
                    source: 'a0'
                  }

                }]
              }
            }
          }
        ],
        user: {
          fullname: 'Chuck Norris',
          avatar_url: 'http://example.com/avatar.jpg'
        },
        datasource: {
          user_name: 'wadus',
          maps_api_template: 'https://{user}.example.com:443',
          stat_tag: 'ece6faac-7271-11e5-a85f-04013fc66a01',
          force_cors: true // This is sometimes set in the editor
        },
        analyses: [
          {
            id: 'a1',
            type: 'buffer',
            params: {
              source: {
                id: 'a0',
                type: 'source',
                params: {
                  'query': 'SELECT * FROM airbnb_listings'
                }
              },
              radio: 300
            }
          }
        ]
      };

      this.vis.load(new VizJSON(this.vizjson));

      // Analyses have been indexed
      expect(this.vis._analysisCollection.size()).toEqual(2);

      var a1 = this.vis.analysis.findNodeById('a1');
      var a0 = this.vis.analysis.findNodeById('a0');

      // Analysis graph has been created correctly
      expect(a1.get('source')).toEqual(a0);
    });

    describe('polling', function () {
      beforeEach(function () {
        spyOn(_, 'debounce').and.callFake(function (func) { return function () { func.apply(this, arguments); }; });

        this.vizjson = {
          'id': '70af2a72-0709-11e6-a834-080027880ca6',
          'version': '3.0.0',
          'title': 'Untitled Map 1',
          'likes': 0,
          'description': null,
          'scrollwheel': false,
          'legends': true,
          'map_provider': 'leaflet',
          'bounds': [
            [
              41.358088,
              2.089675
            ],
            [
              41.448257,
              2.215129
            ]
          ],
          'center': '[41.4031725,2.1524020000000004]',
          'zoom': 11,
          'updated_at': '2016-04-20T17:05:02+00:00',
          'layers': [
            {
              'type': 'layergroup',
              'options': {
                'user_name': 'cdb',
                'maps_api_template': 'http://{user}.localhost.lan:8181',
                'sql_api_template': 'http://{user}.localhost.lan:8080',
                'filter': 'mapnik',
                'layer_definition': {
                  'stat_tag': '70af2a72-0709-11e6-a834-080027880ca6',
                  'version': '3.0.0',
                  'layers': [
                    {
                      'id': 'e0d06945-74cd-4421-8229-561c3cabc854',
                      'type': 'CartoDB',
                      'infowindow': {
                        'fields': [],
                        'template_name': 'table/views/infowindow_light',
                        'template': '<div class=\'CDB-infowindow CDB-infowindow--light js-infowindow\'>\n  <div class=\'CDB-infowindow-container\'>\n    <div class=\'CDB-infowindow-bg\'>\n      <div class=\'CDB-infowindow-inner\'>\n        <ul class=\'CDB-infowindow-list js-content\'>\n          {{#loading}}\n            <div class=\'CDB-Loader js-loader is-visible\'></div>\n          {{/loading}}\n          {{#content.fields}}\n          <li class=\'CDB-infowindow-listItem\'>\n            {{#title}}<h5 class=\'CDB-infowindow-subtitle\'>{{title}}</h5>{{/title}}\n            {{#value}}<h4 class=\'CDB-infowindow-title\'>{{{ value }}}</h4>{{/value}}\n            {{^value}}<h4 class=\'CDB-infowindow-title\'>null</h4>{{/value}}\n          </li>\n          {{/content.fields}}\n        </ul>\n      </div>\n    </div>\n    <div class=\'CDB-hook\'>\n      <div class=\'CDB-hook-inner\'></div>\n    </div>\n  </div>\n</div>\n',
                        'alternative_names': {},
                        'width': 226,
                        'maxHeight': 180
                      },
                      'tooltip': {
                        'fields': [],
                        'template_name': 'tooltip_light',
                        'template': '<div class=\'CDB-Tooltip CDB-Tooltip--isLight\'>\n  <ul class=\'CDB-Tooltip-list\'>\n    {{#fields}}\n      <li class=\'CDB-Tooltip-listItem\'>\n        {{#title}}\n          <h3 class=\'CDB-Tooltip-listTitle\'>{{{ title }}}</h3>\n        {{/title}}\n        <h4 class=\'CDB-Tooltip-listText\'>{{{ value }}}</h4>\n      </li>\n    {{/fields}}\n  </ul>\n</div>\n',
                        'alternative_names': {},
                        'maxHeight': 180
                      },
                      'legend': {
                        'type': 'none',
                        'show_title': false,
                        'title': '',
                        'template': '',
                        'visible': true
                      },
                      'order': 1,
                      'visible': true,
                      'options': {
                        'layer_name': 'arboles',
                        'cartocss': 'cartocss',
                        'cartocss_version': '2.1.1',
                        'interactivity': 'cartodb_id',
                        'source': 'a2'
                      }
                    }
                  ]
                },
                'attribution': ''
              }
            }
          ],
          'overlays': [],
          'widgets': [],
          'datasource': {
            'user_name': 'cdb',
            'maps_api_template': 'http://{user}.localhost.lan:8181',
            'stat_tag': '70af2a72-0709-11e6-a834-080027880ca6'
          },
          'user': {
            'fullname': 'cdb',
            'avatar_url': '//example.com/avatars/avatar_stars_blue.png'
          },
          'analyses': [
            {
              'id': 'a2',
              'type': 'trade-area',
              'params': {
                'source': {
                  'id': 'a1',
                  'type': 'trade-area',
                  'params': {
                    'source': {
                      'id': 'a0',
                      'type': 'source',
                      'params': {
                        'query': 'SELECT * FROM arboles'
                      }
                    },
                    'kind': 'drive',
                    'time': 10
                  }
                },
                'kind': 'drive',
                'time': 10
              }
            }
          ],
          'vector': false
        };
        spyOn($, 'ajax');
      });

      it('should start polling for analyses that are not ready', function () {
        spyOn(this.vis, 'trackLoadingObject');

        this.vis.load(new VizJSON(this.vizjson));
        this.vis.instantiateMap();

        // Response from Maps API is received
        $.ajax.calls.argsFor(0)[0].success({
          'layergroupid': '9d7bf465e45113123bf9949c2a4f0395:0',
          'metadata': {
            'layers': [
              {
                'type': 'mapnik',
                'meta': {
                  'stats': [],
                  'cartocss': 'cartocss'
                }
              }
            ],
            'dataviews': {
              'cd065428-ed63-4d29-9a09-a9f8384fc8c9': {
                'url': {
                  'http': 'http://cdb.localhost.lan:8181/api/v1/map/9d7bf465e45113123bf9949c2a4f0395:0/dataview/cd065428-ed63-4d29-9a09-a9f8384fc8c9'
                }
              }
            },
            'analyses': [
              {
                'nodes': {
                  'a0': {
                    'status': 'ready',
                    'query': 'SELECT * FROM arboles',
                    'url': {
                      'http': 'http://cdb.localhost.lan:8181/api/v1/map/9d7bf465e45113123bf9949c2a4f0395:0/analysis/node/5af683d5d8a6f67e11916a31cd76632884d4064f'
                    }
                  },
                  'a1': {
                    'status': 'pending',
                    'query': 'select * from analysis_trade_area_e65b1ae05854aea96266808ec0686b91f3ee0a81',
                    'url': {
                      'http': 'http://cdb.localhost.lan:8181/api/v1/map/9d7bf465e45113123bf9949c2a4f0395:0/analysis/node/e65b1ae05854aea96266808ec0686b91f3ee0a81'
                    }
                  },
                  'a2': {
                    'status': 'pending',
                    'query': 'select * from analysis_trade_area_b35b1ae05854aea96266808ec0686b91f3ee0a81',
                    'url': {
                      'http': 'http://cdb.localhost.lan:8181/api/v1/map/9d7bf465e45113123bf9949c2a4f0395:0/analysis/node/b75b1ae05854aea96266808ec0686b91f3ee0a81'
                    }
                  }
                }
              }
            ]
          },
          'last_updated': '1970-01-01T00:00:00.000Z'
        });
        expect(this.vis.trackLoadingObject).toHaveBeenCalled();

        // Polling has started
        expect($.ajax.calls.argsFor(1)[0].url).toEqual('http://cdb.localhost.lan:8181/api/v1/map/9d7bf465e45113123bf9949c2a4f0395:0/analysis/node/e65b1ae05854aea96266808ec0686b91f3ee0a81');
        expect($.ajax.calls.argsFor(2)[0].url).toEqual('http://cdb.localhost.lan:8181/api/v1/map/9d7bf465e45113123bf9949c2a4f0395:0/analysis/node/b75b1ae05854aea96266808ec0686b91f3ee0a81');
      });

      it('should NOT start polling for analysis that are "ready" and are the source of a layer', function () {
        this.vis.load(new VizJSON(this.vizjson));
        this.vis.instantiateMap();

        // Response from Maps API is received
        $.ajax.calls.argsFor(0)[0].success({
          'layergroupid': '9d7bf465e45113123bf9949c2a4f0395:0',
          'metadata': {
            'layers': [
              {
                'type': 'mapnik',
                'meta': {
                  'stats': [],
                  'cartocss': 'cartocss'
                }
              }
            ],
            'dataviews': {
              'cd065428-ed63-4d29-9a09-a9f8384fc8c9': {
                'url': {
                  'http': 'http://cdb.localhost.lan:8181/api/v1/map/9d7bf465e45113123bf9949c2a4f0395:0/dataview/cd065428-ed63-4d29-9a09-a9f8384fc8c9'
                }
              }
            },
            'analyses': [
              {
                'nodes': {
                  'a0': {
                    'status': 'ready',
                    'query': 'SELECT * FROM arboles',
                    'url': {
                      'http': 'http://cdb.localhost.lan:8181/api/v1/map/9d7bf465e45113123bf9949c2a4f0395:0/analysis/node/5af683d5d8a6f67e11916a31cd76632884d4064f'
                    }
                  },
                  'a1': {
                    'status': 'ready',
                    'query': 'select * from analysis_trade_area_e65b1ae05854aea96266808ec0686b91f3ee0a81',
                    'url': {
                      'http': 'http://cdb.localhost.lan:8181/api/v1/map/9d7bf465e45113123bf9949c2a4f0395:0/analysis/node/e65b1ae05854aea96266808ec0686b91f3ee0a81'
                    }
                  },
                  'a2': {
                    'status': 'ready',
                    'query': 'select * from analysis_trade_area_b35b1ae05854aea96266808ec0686b91f3ee0a81',
                    'url': {
                      'http': 'http://cdb.localhost.lan:8181/api/v1/map/9d7bf465e45113123bf9949c2a4f0395:0/analysis/node/b75b1ae05854aea96266808ec0686b91f3ee0a81'
                    }
                  }
                }
              }
            ]
          },
          'last_updated': '1970-01-01T00:00:00.000Z'
        });

        // Polling has NOT started, there was only one ajax call to instantiate the map
        expect($.ajax.calls.count()).toEqual(1);
      });

      it("should NOT start polling for analyses that don't have a URL yet", function () {
        this.vis.load(new VizJSON(this.vizjson));
        this.vis.instantiateMap();

        // Analysis node is created using analyse but node is not associated to any layer or dataview
        this.vis.analysis.analyse({
          id: 'something',
          type: 'source',
          params: {
            query: 'SELECT * FROM people'
          }
        });

        // Response from Maps API is received
        $.ajax.calls.argsFor(0)[0].success({
          'layergroupid': '9d7bf465e45113123bf9949c2a4f0395:0',
          'metadata': {
            'layers': [
              {
                'type': 'mapnik',
                'meta': {
                  'stats': [],
                  'cartocss': 'cartocss'
                }
              }
            ],
            'dataviews': { },
            'analyses': [
              {
                'nodes': {
                  'a0': {
                    'status': 'ready',
                    'query': 'SELECT * FROM arboles',
                    'url': {
                      'http': 'http://cdb.localhost.lan:8181/api/v1/map/9d7bf465e45113123bf9949c2a4f0395:0/analysis/node/5af683d5d8a6f67e11916a31cd76632884d4064f'
                    }
                  },
                  'a1': {
                    'status': 'ready',
                    'query': 'select * from analysis_trade_area_e65b1ae05854aea96266808ec0686b91f3ee0a81',
                    'url': {
                      'http': 'http://cdb.localhost.lan:8181/api/v1/map/9d7bf465e45113123bf9949c2a4f0395:0/analysis/node/e65b1ae05854aea96266808ec0686b91f3ee0a81'
                    }
                  },
                  'a2': {
                    'status': 'ready',
                    'query': 'select * from analysis_trade_area_b35b1ae05854aea96266808ec0686b91f3ee0a81',
                    'url': {
                      'http': 'http://cdb.localhost.lan:8181/api/v1/map/9d7bf465e45113123bf9949c2a4f0395:0/analysis/node/b75b1ae05854aea96266808ec0686b91f3ee0a81'
                    }
                  }
                }
              }
            ]
          },
          'last_updated': '1970-01-01T00:00:00.000Z'
        });

        // Polling has NOT started, there was only one ajax call to instantiate the map
        expect($.ajax.calls.count()).toEqual(1);
      });

      it('should reload the map when analysis is done', function () {
        this.vis.load(new VizJSON(this.vizjson));
        this.vis.instantiateMap();

        // Response from Maps API is received
        $.ajax.calls.argsFor(0)[0].success({
          'layergroupid': '9d7bf465e45113123bf9949c2a4f0395:0',
          'metadata': {
            'layers': [
              {
                'type': 'mapnik',
                'meta': {
                  'stats': [],
                  'cartocss': 'cartocss'
                }
              }
            ],
            'dataviews': {
              'cd065428-ed63-4d29-9a09-a9f8384fc8c9': {
                'url': {
                  'http': 'http://cdb.localhost.lan:8181/api/v1/map/9d7bf465e45113123bf9949c2a4f0395:0/dataview/cd065428-ed63-4d29-9a09-a9f8384fc8c9'
                }
              }
            },
            'analyses': [
              {
                'nodes': {
                  'a0': {
                    'status': 'ready',
                    'query': 'SELECT * FROM arboles',
                    'url': {
                      'http': 'http://cdb.localhost.lan:8181/api/v1/map/9d7bf465e45113123bf9949c2a4f0395:0/analysis/node/5af683d5d8a6f67e11916a31cd76632884d4064f'
                    }
                  },
                  'a1': {
                    'status': 'pending',
                    'query': 'select * from analysis_trade_area_e65b1ae05854aea96266808ec0686b91f3ee0a81',
                    'url': {
                      'http': 'http://cdb.localhost.lan:8181/api/v1/map/9d7bf465e45113123bf9949c2a4f0395:0/analysis/node/e65b1ae05854aea96266808ec0686b91f3ee0a81'
                    }
                  },
                  'a2': {
                    'status': 'pending',
                    'query': 'select * from analysis_trade_area_b35b1ae05854aea96266808ec0686b91f3ee0a81',
                    'url': {
                      'http': 'http://cdb.localhost.lan:8181/api/v1/map/9d7bf465e45113123bf9949c2a4f0395:0/analysis/node/b75b1ae05854aea96266808ec0686b91f3ee0a81'
                    }
                  }
                }
              }
            ]
          },
          'last_updated': '1970-01-01T00:00:00.000Z'
        });
        expect($.ajax.calls.argsFor(0)[0].url).toEqual('http://cdb.localhost.lan:8181/api/v1/map?stat_tag=70af2a72-0709-11e6-a834-080027880ca6');
        expect($.ajax.calls.argsFor(1)[0].url).toEqual('http://cdb.localhost.lan:8181/api/v1/map/9d7bf465e45113123bf9949c2a4f0395:0/analysis/node/e65b1ae05854aea96266808ec0686b91f3ee0a81');
        expect($.ajax.calls.argsFor(2)[0].url).toEqual('http://cdb.localhost.lan:8181/api/v1/map/9d7bf465e45113123bf9949c2a4f0395:0/analysis/node/b75b1ae05854aea96266808ec0686b91f3ee0a81');

        expect($.ajax.calls.count()).toEqual(3);

        // Analysis endpoint for a1 responds
        $.ajax.calls.argsFor(1)[0].success({status: 'ready'});

        // Map is not reloaded because a1 is not the source of a layer
        expect($.ajax.calls.count()).toEqual(3);

        // Analysis endpoint for a2 responds
        $.ajax.calls.argsFor(2)[0].success({status: 'ready'});

        // Map has been reloaded because a2 is the source of a layer
        expect($.ajax.calls.count()).toEqual(4);
        expect($.ajax.calls.argsFor(3)[0].url).toEqual('http://cdb.localhost.lan:8181/api/v1/map?stat_tag=70af2a72-0709-11e6-a834-080027880ca6');
      });
    });
  });

  describe('.done', function () {
    it('should invoke the callback when model triggers a `done` event', function () {
      var callback = jasmine.createSpy('callback');
      this.vis.done(callback);

      this.vis.trigger('done');

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('.error', function () {
    it('should invoke the callback when model triggers an `error` event', function () {
      var callback = jasmine.createSpy('callback');
      this.vis.error(callback);

      this.vis.trigger('error');

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('when a vizjson has been loaded', function () {
    beforeEach(function () {
      this.vis = new Vis();
    });

    describe('.getLayers', function () {
      it('should return layers from map', function () {
        this.vis.load(new VizJSON(fakeVizJSON()));

        expect(this.vis.getLayers().length).toEqual(3);
      });
    });

    describe('.getLayer', function () {
      it('should return the layer in the given index', function () {
        var vizjson = fakeVizJSON();
        this.vis.load(new VizJSON(vizjson));

        expect(this.vis.getLayer(0).get('id')).toEqual(vizjson.layers[0].id);
        expect(this.vis.getLayer(1).get('id')).toEqual(vizjson.layers[1].options.layer_definition.layers[0].id);
        expect(this.vis.getLayer(2).get('id')).toEqual(vizjson.layers[2].id);
      });
    });

    describe('.invalidateSize', function () {
      it('should just trigger an event', function () {
        var callback = jasmine.createSpy('callback');
        this.vis.bind('invalidateSize', callback);

        this.vis.invalidateSize();

        expect(callback).toHaveBeenCalled();
      });
    });

    describe('.centerMapToOrigin', function () {
      it('should invalidate size and re-center the map', function () {
        var callback = jasmine.createSpy('callback');
        this.vis.bind('invalidateSize', callback);

        this.vis.load(new VizJSON(fakeVizJSON()));

        spyOn(this.vis.map, 'reCenter');

        this.vis.centerMapToOrigin();

        expect(this.vis.map.reCenter).toHaveBeenCalled();
        expect(callback).toHaveBeenCalled();
      });
    });
  });
});
