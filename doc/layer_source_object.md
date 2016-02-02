# Layer Source Object

### Standard Layer Source Object (_type: 'cartodb'_)

Used for most maps with tables that are set to public or public with link.

#### Arguments

Layer Source Objects are defined with the [MapConfig](http://docs.cartodb.com/cartodb-platform/maps-api/mapconfig/#mapconfig-file-format) configurations.

Name |Description
--- | ---
type | A string value that defines the layer type. Required.<br /><br />Options include: `mapnik', `cartodb`, `torque`, `http`, `plain`, `named`.<br /><br />**Note:** See [Layergroup Configurations](http://docs.cartodb.com/cartodb-platform/maps-api/mapconfig/#layergroup-configurations) for a description of these layer types.

options | Options vary, depending on the `type` of layer source you are using:
--- | ---
&#124;_ [Mapnik Layer Options](http://docs.cartodb.com/cartodb-platform/maps-api/mapconfig/#mapnik-layer-options)| 
&#124;_ [Torque Layer Options](http://docs.cartodb.com/cartodb-platform/maps-api/mapconfig/#torque-layer-options) | 
&#124;_ [HTTP Layer Options](http://docs.cartodb.com/cartodb-platform/maps-api/mapconfig/#http-layer-options) | 
&#124;_ [Plain Layer Options](http://docs.cartodb.com/cartodb-platform/maps-api/mapconfig/#plain-layer-options) | 
&#124;_ [Named Map Layer Options](http://docs.cartodb.com/cartodb-platform/maps-api/mapconfig/#named-map-layer-options) | 

#### Example

```javascript
{
  user_name: 'your_user_name', // Required
  type: 'cartodb', // Required
  sublayers: [{
    sql: "SELECT * FROM table_name", // Required
    cartocss: '#table_name {marker-fill: #F0F0F0;}', // Required
    interactivity: "column1, column2, ...", // Optional
  },
  {
    sql: "SELECT * FROM table_name", // Required
    cartocss: '#table_name {marker-fill: #F0F0F0;}', // Required
    interactivity: "column1, column2, ...", // Optional
   },
   ...
  ]
}
```

### Named Maps Layer Source Object (_type: 'namedmap'_)

Used for making public maps with private data. See [Named Maps](http://docs.cartodb.com/cartodb-platform/maps-api/named-maps/) for more information.

#### Example

```javascript
{
  user_name: 'your_user_name', // Required
  type: 'namedmap', // Required
  named_map: {
    name: 'name_of_map', // Required
    // Optional
    layers: [{
      layer_name: "sublayer0", // Optional
      interactivity: "column1, column2, ..." // Optional
    },
    {
      layer_name: "sublayer1",
      interactivity: "column1, column2, ..."
    },
      ...
    ],
    // Optional
    params: {
      color: "hex_value",
      num: 2
    }
  }
}
```

### Multiple types of layers Source Object

`cartodb.createLayer` combining multiple types of layers and setting a filter

#### Example

```javascript
cartodb.createLayer(map, {
  user_name: 'examples',
  type: 'cartodb',
  sublayers: [
    {
      type: "http",
      urlTemplate: "http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png",
      subdomains: [ "a", "b", "c" ]
    },
    {
     sql: 'select * from country_boundaries',
     cartocss: '#layer { polygon-fill: #F00; polygon-opacity: 0.3; line-color: #F00; }'
    },
  ],
}, { filter: ['http', 'mapnik'] })
```
