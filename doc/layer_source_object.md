# Layer Source Object

### Standard Layer Source Object (_type: 'cartodb'_)

Used for most maps with tables that are set to public or public with link.

#### Example

```javascript
{
  type: 'torque', // Required
  order: 1, // Optional
  options: {
    query: "SQL statement",   // Required if table_name is not given
    table_name: "table_name",   // Required if query is not given
    user_name: "your_user_name", // Required
    cartocss: "CartoCSS styles" // Required
  }
}
```

### Torque Layer Source Object (_type: 'torque'_)

Used for [Torque maps](https://github.com/CartoDB/torque). Note that it does not allow sublayers.

#### Example

```javascript
// initialize a torque layer that uses the CartoDB account details and SQL API to pull in data
var torqueLayer = new L.TorqueLayer({
  user : 'viz2',
  table : 'ow',
  cartocss: CARTOCSS
});
```

## Interaction Methods for a Torque Layer

Used to create an animated torque layer with customized settings.

### getValueForPos(_x, y[, step]_)

--- | ---
Description | Allows to get the value for the coordinate (in map reference system) for a concrete step. If a step is not specified, the animation step is used. Use caution, as this method increases CPU usage. It returns the value from the raster data, not the rendered data.
Returns | An object, such as a { bbox:[], value: VALUE } if there is value for the pos, otherwise, it is null.

### getValueForBBox(_xstart, ystart, xend, yend_)

--- | ---
Description | Returns an accumulated numerical value from all the torque areas, within the specified bounds.
Returns | A number.

### getActivePointsBBox(_step_)

--- | ---
Description | Returns the list of bounding boxes active for `step`.
Returns | List of bbox:[].

### getValues(_step_)

--- | ---
Description | Returns the list of values for the pixels active in `step`.
Returns | List of values.

### invalidate()

--- | ---
Description | Forces a reload of the layer data.

#### Example

```javascript
 <script>
// define the torque layer style using cartocss
// this creates a kind of density map
// color scale from http://colorbrewer2.org/
var CARTOCSS = [
  'Map {',
  '-torque-time-attribute: "date";',
  '-torque-aggregation-function: "avg(temp::float)";',
  '-torque-frame-count: 1;',
  '-torque-animation-duration: 15;',
  '-torque-resolution: 16',
  '}',
  '#layer {',
  '  marker-width: 8;',
  '  marker-fill-opacity: 1.0;',
  '  marker-fill: #fff5eb; ',
  '  marker-type: rectangle;',
  '  [value > 1] { marker-fill: #fee6ce; }',
  '  [value > 2] { marker-fill: #fdd0a2; }',
  '  [value > 4] { marker-fill: #fdae6b; }',
  '  [value > 10] { marker-fill: #fd8d3c; }',
  '  [value > 15] { marker-fill: #f16913; }',
  '  [value > 20] { marker-fill: #d94801; }',
  '  [value > 25] { marker-fill: #8c2d04; }',
  '}'
].join('\n');

var map = new L.Map('map', {
  zoomControl: true,
  center: [40, 0],
  zoom: 3
});
L.tileLayer('http://{s}.api.cartocdn.com/base-dark/{z}/{x}/{y}.png', {
  attribution: 'CartoDB'
}).addTo(map);
var torqueLayer = new L.TorqueLayer({
  user : 'viz2',
  table : 'ow',
  cartocss: CARTOCSS
});
torqueLayer.addTo(map);
map.on('click', function(e) {
  var p = e.containerPoint
  var value = torqueLayer.getValueForPos(p.x, p.y);
  if (value !== null) {
    map.openPopup('average temperature: ' + value.value + "C", e.latlng);
  }
});
```

### Named Maps Layer Source Object (_type: 'namedmap'_)

Used for making public maps with private data. See [Named Maps](/cartodb-platform/maps-api/named-maps/) for more information.

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
