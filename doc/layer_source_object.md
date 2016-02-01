# Layer Source Object

### Standard Layer Source Object (_type: 'cartodb'_)

Used for most maps with tables that are set to public or public with link.

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
