# API methods

This documentation is intended for developers and describes specific methods from the [latest version](https://github.com/CartoDB/cartodb.js/releases) of the CartoDB.js library.

## cartodb.createVis

### cartodb.createVis(_map_id, vizjson_url[, options] [, callback]_)

Creates a visualization inside the map_id DOM object.

#### Arguments

Name |Description
--- | ---
map_id | a DOM object, for example `$('#map')` or a DOM id.
vizjson_url | url of the vizjson object.

options |
--- | ---
&#124;_ shareable | add facebook and twitter share buttons.
&#124;_ title | adds a header with the title of the visualization.
&#124;_ description | adds description to the header (as you set in the UI).
&#124;_ search | adds a search control (default: true).
&#124;_ zoomControl | adds zoom control (default: true).
&#124;_ loaderControl | adds loading control (default: true).
&#124;_ center_lat | latitude where the map is initializated.
&#124;_ center_lon | longitude where the map is initializated.
&#124;_ zoom | initial zoom.
&#124;_ cartodb_logo | default to true, set to false if you want to remove the cartodb logo.
&#124;_ infowindow | set to false if you want to disable the infowindow (enabled by default).
&#124;_ time_slider | show an animated time slider with Torque layers. This option is enabled by default, as shown with `time_slider: true` value. To disable the time slider, use `time_slider: false`. See [No Torque Time Slider - Example Code](http://bl.ocks.org/michellechandra/081ca7160a8c782266d2) for an example.<br/><br/> For details about customizing the time slider, see the [Torque.js](http://docs.cartodb.com/cartodb-platform/torque/torque-time-slider/) documentation.
&#124;_ layer_selector | show layer selector (default: false).
&#124;_ legends | if it's true legends are shown in the map.
&#124;_ https | if true, it makes sure that basemaps are converted to https when possible. If explicitly false, converts https maps to http when possible. If undefined, the basemap template is left as declared at `urlTemplate` in the viz.json.
&#124;_ scrollwheel | enable/disable the ability of zooming using scrollwheel (default enabled)
&#124;_ fullscreen | if true adds a button to toggle the map fullscreen
&#124;_ mobile_layout | if true enables a custom layout for mobile devices (default: false)
&#124;_ force_mobile | forces enabling/disabling the mobile layout (it has priority over mobile_layout argument)
&#124;_ gmaps_base_type | Use Google Maps as map provider whatever is the one specified in the viz.json". Available types: 'roadmap', 'gray_roadmap', 'dark_roadmap', 'hybrid', 'satellite', 'terrain'.
&#124;_ gmaps_style | Google Maps styled maps. See [documentation](https://developers.google.com/maps/documentation/javascript/styling).
&#124;_ no_cdn | true to disable CDN when fetching tiles
callback(vis,layers) | if a function is specified, it is called once the visualization is created, passing vis and layers as arguments

#### Returns

A promise object. You can listen for the following events:

Event | Description
--- | ---
done | triggered when the visualization is created, `vis` is passed as the first argument and `layers` is passed as the second argument. Each layer type has different options, see layers section.
error | triggered when the layer couldn't be created. The error string is the first argument.

#### Example

```javascript
var url = 'http://documentation.cartodb.com/api/v2/viz/2b13c956-e7c1-11e2-806b-5404a6a683d5/viz.json';

cartodb.createVis('map', url)
  .done(function(vis, layers) {
  });
```

---

## cartodb.Vis

### vis.getLayers()

Returns an array of layers in the map. The first is the base layer.

### vis.addOverlay(_options_)

Adds an overlay to the map that can be either a tooltip or an infobox.

#### Arguments

Option | Description
--- | ---
layer | layer from the visualization where the overlay should be applied (optional)
type | - tooltip (an infowindow that appears when you hover your mouse over a map feature)<br /><br /> - infobox (similar to a tooltip but always appears in the same fixed position that you define)

If no layer is provided, the overlay will be added to the first layer of the visualization. Extra options are available based on the [specific UI function](http://docs.cartodb.com/cartodb-platform/cartodb-js/ui-functions/#specific-ui-functions).

#### Returns

An overlay object, see [vis.Overlays](#visoverlays).

#### Example (Infowindow with Tooltip)

The following example displays how to enable infowindow interactivity with the mouse "hover" action. The hover action is referred to as a tooltip, and enables you to control the positioning.

{% highlight html %}
layer.leafletMap.viz.addOverlay({
  type: 'tooltip',
  layer: sublayer,
  template: '<div class="cartodb-tooltip-content-wrapper"><img style="width: 100%" src={{_url}}>{{name}}, {{age}}, {{city}}, {{country}}</div>', 
  position: 'bottom|right',
  fields: [{ name: 'name' }]
});
{% endhighlight %}

**Tip:** For a description of the infowindow specific parameters, see [`cartodb.vis.Vis.addInfowindow(_map, layer, fields [, options]_)`](/cartodb-platform/cartodb-js/ui-functions/#cartodbvisvisaddinfowindowmap-layer-fields--options). Optionally, you can also use the `cartodb.vis.Vis.addInfowindow` function to define the click action for an infowindow.

### vis.getOverlay(_type_)

Returns the first overlay with the specified **type**.

#### Example

```javascript
var zoom = vis.getOverlay('zoom');
```

### vis.getOverlays()

Returns a list of the overlays that are currently on the screen (see overlays description).

### vis.getNativeMap()

Returns the native map object being used (e.g. a `L.Map` object for Leaflet).

### vis.Overlays

An overlay is a control shown on top of the map.

Overlay objects are always created using the `addOverlay` method of a `cartodb.Vis` object.

An overlay is internally a [Backbone.View](http://backbonejs.org/#View) so if you know how Backbone works you can use it. If you want to use plain DOM objects you can access `overlay.el` (`overlay.$el` for jQuery object).

### vis.addCursorInteraction

Changes the cursor to a finger point when hovering over a map feature.

#### Example

{% highlight html %}
addCursorInteraction: function(map, layer) {
    var mapView = map.viz.mapView;
    layer.bind('mouseover', function() {
      mapView.setCursor('pointer');
    });
{% endhighlight %}

For more examples, see [cursor_interaction.html](https://github.com/CartoDB/cartodb.js/blob/develop/examples/cursor_interaction.html) and the [Google Map Driving Directions](http://docs.cartodb.com/tutorials/google_driving_directions/#google-map-driving-directions) tutorial.

### vis.removeCursorInteraction

Removes the cursor interaction if it was previously enabled with `addCursorInteraction`.

#### Example

{% highlight html %}
removeCursorInteraction: function(map, layer) {
    var mapView = map.viz.mapView;
    layer.unbind(null, null, mapView);
  }
{% endhighlight %}


## cartodb.createLayer(_map, layerSource [, options] [, callback]_)

With visualizations already created through the CartoDB console, you can simply use the `createLayer` function to add them into your web pages. Unlike `createVis`, this method requires an already activated `map` object and it does not load a basemap for you.

#### Arguments

Name |Description
--- | ---
map | Leaflet `L.Map` object. The map should be initialized before calling this function.
layerSource | contains information about the layer. It can be specified in multiple ways<br/><br/>**Tip:** See [Multiple types of layers Source Object](http://docs.cartodb.com/cartodb-platform/cartodb-js/layer-source-object/#multiple-types-of-layers-source-object)

options |
--- | ---
&#124;_ https | loads the layer as HTTPS. True forces the layer to load. See [HTTPS support](http://docs.cartodb.com/cartodb-platform/cartodb-js/other-stuff/#https-support) for example code.
&#124;_ refreshTime | if is set, the layer is refreshed each refreshTime milliseconds. See a refreshTime code [example](https://github.com/CartoDB/cartodb.js/blob/develop/examples/createLayer_refresh_time.html).
&#124;_ infowindow | set to false if you want to disable the infowindow (enabled by default). For details, see [Creating an infowindow with the `createLayer()` function](http://docs.cartodb.com/faqs/infowindows/#creating-an-infowindow-with-the-createlayer-function).
&#124;_ tooltip | set to false if you want to disable the tooltip (enabled by default). This option is specific for when you create a map using the CartoDB Editor, and have enabled the tooltip [(infowindow hover)](http://docs.cartodb.com/cartodb-editor/maps/#infowindows) option. This option disables the tooltip in createLayer.<br/><br/>See a tooltip code [example](https://github.com/CartoDB/cartodb.js/blob/develop/examples/createLayer_custom_tooltip.html).
&#124;_ legends | set to true to show legends in the map. For an example, see this [CartoDB.js example with legends disabled](https://github.com/CartoDB/cartodb.js/blob/develop/examples/createLayer_noLegend.html).
&#124;_ time_slider | show an animated time slider with Torque layers. This option is enabled by default, as shown with `time_slider: true` value. To disable the time slider, use `time_slider: false`. See a Torque Time Slider code [example](https://github.com/CartoDB/cartodb.js/blob/develop/examples/torque_time_slider.html).<br/><br/> For details about customizing the time slider, see the [Torque.js](http://docs.cartodb.com/cartodb-platform/torque/torque-time-slider/) documentation.
&#124;_ layerIndex | when the visualization contains more than one layer this index allows you to select what layer is created. Take into account that `layerIndex == 0` is the base layer and that all the tiled layers (non animated ones) are merged into a single one. The default value for this option is 1 (usually tiled layers).<br/><br/>See [`layer.featureOver(_event, latlng, pos, data, layerIndex_`)](http://docs.cartodb.com/cartodb-platform/cartodb-js/events/#layerfeatureoverevent-latlng-pos-data-layerindex) for details about binding functions to layer events.
&#124;_ filter | A string, or array of values, that specifies the type(s) of sublayers to be rendered if you are using multiple types of layer source objects (eg: `['http', 'mapnik')](http://docs.cartodb.com/cartodb-platform/maps-api/mapconfig/#layergroup-configurations). All non-torque layers (http and mapnik) will be rendered if this option is not present.<br/><br/>See a createLayer filter [example](http://docs.cartodb.com/cartodb-platform/cartodb-js/layer-source-object/#multiple-types-of-layers-source-object).
&#124;_ no_cdn | set to true to disable CDN when fetching tiles. For a complete example of this code, see ["odyssey_test.html"](https://github.com/CartoDB/cartodb.js/blob/2983b2fdcef914afdb1f4fdae173471143930452/examples/odyssey_test.html).
callback(_layer_) | if a function is specified, it will be invoked after the layer has been created. The layer will be passed as an argument.<br/><br/> See the [example of loading multiple layers from Cartodb in a Leaflet Map](https://github.com/CartoDB/cartodb.js/blob/develop/examples/callback_layer.html).

### Passing the url where the layer data is located
```javascript
cartodb.createLayer(map, 'http://myserver.com/layerdata.json')
```

### Passing the data directly
```javascript
cartodb.createLayer(map, { layermetadata })
```

#### Returns

A promise object. You can listen for the following events:

Events | Description
--- | ---
done | triggered when the layer is created, the layer is passed as first argument. Each layer type has different options, see layers section.
error | triggered when the layer couldn't be created. The error string is the first argument.

You can call to `addTo(map[, position])` in the promise so when the layer is ready it will be added to the map.

#### Example

`cartodb.createLayer` using a url

```javascript
var map;
var mapOptions = {
  zoom: 5,
  center: [43, 0]
};
map = new L.Map('map', mapOptions);

cartodb.createLayer(map, 'http://documentation.cartodb.com/api/v2/viz/2b13c956-e7c1-11e2-806b-5404a6a683d5/viz.json')
  .addTo(map)
  .on('done', function(layer) {
    layer
      .on('featureOver', function(e, latlng, pos, data) {
        console.log(e, latlng, pos, data);
      })
      .on('error', function(err) {
        console.log('error: ' + err);
      });
  }).on('error', function(err) {
    console.log("some error occurred: " + err);
  });
```

Layer metadata must take one of the forms of the [Layer Source Object](http://docs.cartodb.com/cartodb-platform/cartodb-js/layer-source-object/).

---

## cartodb.CartoDBLayer

CartoDBLayer allows you to manage tiled layers from CartoDB. It manages the sublayers.

### layer.clear()

Clears the layer. It should be invoked after removing the layer from the map.

### layer.hide()

Hides the layer from the map.

### layer.show()

Shows the layer in the map if it was previously added.

### layer.toggle()

Toggles the visibility of the layer and returns a boolean that indicates the new status (true if the layer is shown, false if it is hidden)

### layer.setOpacity(_opacity_)

Changes the opacity of the layer.

#### Arguments

Name |Description
--- | ---
opacity | value in range [0, 1]

### layer.getSubLayer(_layerIndex_)

Gets a previously created sublayer. And exception is raised if no sublayer exists.

#### Arguments

Name |Description
--- | ---
layerIndex | 0 based index of the sublayer to get. Should be within [0, getSubLayerCount())

#### Returns

A `SubLayer` object.

#### Example

```javascript
layer.getSubLayer(1).hide();

var sublayer = layer.getSubLayer(0);

sublayer.setSQL('SELECT * FROM table_name limit 10');
```

### layer.getSubLayerCount()

Gets the number of sublayers in layer.

#### Returns

The number of sublayers.

#### Example

Hide layers using `layer.getSubLayerCount`

```javascript
var num_sublayers = layer.getSubLayerCount();

for (var i = 0; i < num_sublayers; i++) {
  layer.getSubLayer(i).hide();
}
```

### layer.createSubLayer(_layerDefinition_)

Adds a new data to the current layer. With this method, data from multiple tables can be easily visualized.

#### Arguments

Name |Description
--- | ---
layerDefinition | an object with the sql and cartocss that defines the data, should be like

```javascript
{
  sql: "SELECT * FROM table_name",
  cartocss: "#layer { marker-fill: red; }",
  interactivity: 'cartodb_id, area, column' // optional
}
```

`sql` and `cartocss` are mandatory. An exception is raised if either of them are not present. If the interactivity is not set, there is no interactivity enabled for that layer (better performance). SQL and CartoCSS syntax should be correct. Look at the documentation for  [PostgreSQL](http://www.postgresql.org/docs/9.3/interactive/sql-syntax.html) and [CartoCSS](https://github.com/mapbox/carto/blob/master/docs/latest.md) for more information. There are some restrictions in the SQL queries:

- Must not write. INSERT, DELETE, UPDATE, ALTER and so on are not allowed (the query will fail)
- Must not contain trialing semicolon

#### Returns

A `SubLayer` object.

#### Example

```javascript
cartodb.createLayer(map, 'http://examples.cartodb.com/api/v2/viz/european_countries_e/viz.json', function(layer) {
  // add populated places points over the countries layer
  layer.createSubLayer({
    sql: 'SELECT * FROM ne_10m_populated_places_simple',
    cartocss: '#layer { marker-fill: red; }'
  });
}).addTo(map);
```

### layer.invalidate()

Refreshes the data. If the data has been changed in the CartoDB server those changes will be displayed. Nothing happens otherwise. Every time a parameter is changed in a sublayer, the layer is refreshed automatically, so there's no need to call this method manually.

### layer.setAuthToken(_auth_token_)

Sets the auth token that will be used to create the layer. Only available for private visualizations. An exception is
raised if the layer is not being loaded with HTTPS. See [Named Maps](http://docs.cartodb.com/cartodb-platform/maps-api.html#named-maps-1) for more information.

#### Arguments

Name |Description
--- | ---
auth_token | string

#### Returns

The layer itself.

### layer.setParams(_key, value_)

Sets the configuration of a layer when using [Named Maps](/cartodb-platform/maps-api/named-maps/). It can be invoked in different ways.

**Note:** This function is not supported when using Named Maps for Torque.

#### Arguments

Name |Description
--- | ---
key | string
value | string or number

#### Returns

The layer itself.

#### Example

```javascript
layer.setParams('test', 10); // sets test = 10
layer.setParams('test', null); // unset test
layer.setParams({'test': 1, 'color': '#F00'}); // set more than one parameter at once
```

---

## cartodb.SubLayerBase

### sublayer.set(_layerDefinition_)

Sets sublayer parameters. Useful when more than one parameter needs to be changed.

#### Arguments

Name |Description
--- | ---
layerDefinition | an object with the sql and cartocss that defines the data

#### Returns

The layer itself.

#### Example

```javascript
sublayer.set({
  sql: "SELECT * FROM table_name WHERE cartodb_id < 100",
  cartocss: "#layer { marker-fill: red }",
  interactivity: "cartodb_id, the_geom, magnitude"
});
```

### sublayer.get(_attr_)

Gets the attribute for the sublayer, for example 'sql', 'cartocss'.

#### Returns

The requested attribute or `undefined` if it's not present.

### sublayer.remove()

Removes the sublayer. An exception will be thrown if a method is called and the layer has been removed.

### sublayer.show()

Shows a previously hidden sublayer. The layer is refreshed after calling this function.

### sublayer.hide()

Removes the sublayer from the layer temporarily. The layer is refreshed after calling this function.

### sublayer.toggle()

Toggles the visibility of the sublayer and returns a boolean that indicates the new status (`true` if the sublayer is visible, `false` if it is hidden)

### sublayer.isVisible()

It returns `true` if the sublayer is visible.

## cartodb.CartoDBSubLayer

_This is a subclass of [`cartodb.SubLayerBase`](#cartodbsublayerbase)._

### sublayer.getSQL()

Shortcut for `get('sql')`

### sublayer.getCartoCSS()

Shortcut for `get('cartocss')`

### sublayer.setSQL(_sql_)

Shortcut for `set({'sql': 'SELECT * FROM table_name'})`

### sublayer.setCartoCSS(_css_)

Shortcut for `set({'cartocss': '#layer {...}' })`

### sublayer.setInteractivity(_'cartodb_id, name, ...'_)

Shortcut for `set({'interactivity': 'cartodb_id, name, ...' })`

Sets the columns which data will be available via the interaction with the sublayer.

### sublayer.setInteraction(_true_)

Enables (`true`) or disables (`false`) the interaction of the layer. When disabled, **featureOver**, **featureClick**, **featureOut**, **mouseover** and **mouseout** are **not** triggered.

#### Arguments

Name |Description
--- | ---
enable | `true` if the interaction needs to be enabled.

### sublayer.infowindow

`sublayer.infowindow` is a Backbone model where we modify the parameters of the [infowindow](/cartodb-platform/cartodb-js/ui-functions/#cartodbvisvisaddinfowindowmap-layer-fields--options).

#### Attributes

Name | Description
--- | ---
template | Custom HTML template for the infowindow. You can write simple HTML or use [Mustache templates](http://mustache.github.com/).
sanitizeTemplate | By default all templates are sanitized from unsafe tags/attrs (e.g. `<script>`), set this to `false` to skip sanitization, or a function to provide your own sanitization (e.g. `function(inputHtml) { return inputHtml })`).
width | Width of the infowindow (value must be a number).
maxHeight | Max height of the scrolled content (value must be a number).

**Tip:** If you are customizing your infowindow with CartoDB.js, reference the [CSS library](https://github.com/CartoDB/cartodb.js/tree/develop/themes/css/infowindow) for the latest stylesheet code.

#### Example

```html
<div id="map"></div>

<script>
  sublayer.infowindow.set({
    template: $('#infowindow_template').html(),
    width: 218,
    maxHeight: 100
  });
</script>

<script type="infowindow/html" id="infowindow_template">
  <span> custom </span>
  <div class="cartodb-popup v2">
    <a href="#close" class="cartodb-popup-close-button close">x</a>

     <div class="cartodb-popup-content-wrapper">
       <div class="cartodb-popup-content">
         <img style="width: 100%" src="http://rambo.webcindario.com/images/18447755.jpg"></src>
         <!-- content.data contains the field info -->
         <h4>{{content.data.name}}</h4>
       </div>
     </div>
     <div class="cartodb-popup-tip-container"></div>
  </div>
</script>
```

[Grab the complete example source code](https://github.com/CartoDB/cartodb.js/blob/develop/examples/custom_infowindow.html)

---

## cartodb.HttpSubLayer

_This is a subclass of [`cartodb.SubLayerBase`](#cartodbsublayerbase)._

### sublayer.setURLTemplate(_urlTemplate_)

Shortcut for `set({'urlTemplate': 'http://{s}.example.com/{z}/{x}/{y}.png' })`

### sublayer.setSubdomains(_subdomains_)

Shortcut for `set({'subdomains': ['a', 'b', '...'] })`

### sublayer.setTms(_tms_)

Shortcut for `set({'tms': true|false })`

### sublayer.getURLTemplate

Shortcut for `get('urlTemplate')`

### sublayer.getSubdomains

Shortcut for `get('subdomains')`

### sublayer.getTms

Shortcut for `get('tms')`

### sublayer.legend

`sublayer.legend` is a Backbone model with the information about the legend.

#### Attributes

Name | Description
--- | ---
template | Custom HTML template for the legend. You can write simple HTML.
title | Title of the legend.
show_title | Set this to `false` if you don't want the title to be displayed.
items | An array with the items that are displayed in the legend.
visible | Set this to `false` if you want to hide the legend.
