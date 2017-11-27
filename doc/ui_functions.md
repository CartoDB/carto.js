# Specific UI Functions

There are a few functions in CARTO.js for creating, enabling, and disabling pieces of the user interface.

## vis.addOverlay(tooltip)

A tooltip is an infowindow that appears when you hover your mouse over a map feature with [`vis.addOverlay(options)`](http://docs.carto.com/carto-engine/carto-js/api-methods/#visaddoverlayoptions). A tooltip appears where the mouse cursor is located on the map. You can customize the position of how the tooltip appears by defining the position options.

#### Example

```javascript
var tooltip = vis.addOverlay({
  type: 'tooltip',
  template: '<p>{{variable}}</p>' // mustache template
  width: 200,
  position: 'bottom|right', // top, bottom, left and right are available
  fields: [{ name: 'name', population: 'pop2005' }]
});
```
**Note:** If you are using `createLayer` for a map object that contains an enabled tooltip, you can disable the tooltip by applying the `false` value. See the [cartodb.createLayer(map, layerSource [, options] [, callback])](https://carto.com/docs/carto-engine/carto-js/api-methods/#cartodbcreatelayermap-layersource--options--callback) `tooltip` description for how to enable/disable an interactive tooltip.

## vis.addOverlay(infobox)

Similar to a tooltip, an infobox displays a small box when you hover your mouse over a map feature. When viewing an infobox on a map, _the position of the infobox is fixed_, and always appears in the same position; depending on how you defined the position values for the infobox.

#### Example

```javascript
var infoBox = layer.leafletMap.viz.addOverlay({
  type: 'infobox',
  template: '<p>{{name_to_display}}</p>',
  width: 200, // width of the box
  position: 'bottom|right' // top, bottom, left and right are available
});
```

## cartodb.vis.Vis.addInfowindow(_map, layer, fields [, options]_)

Infowindows provide additional interactivity for your published map, controlled by layer events. It enables interaction and overrides the layer interactivity. A pop-up information window appears when a viewer clicks on a map feature. 

#### Arguments

Option | Description
--- | ---
map | native map object or leaflet.
layer | cartodb layer (or sublayer).
fields | array of column names.<br /><br />**Note:** This tells CARTO what columns from your dataset should appear in your infowindow.
options | 
--- | ---
&#124;_ infowindowTemplate | allows you to set the HTML of the template.
&#124;_templateType | indicates the type of template ([`Mustache` template](http://mustache.github.io/mustache.5.html) or `Underscore` template placeholders).

**Tip:** See [How can I use CARTO.js to create and style infowindows?](http://docs.carto.com/faqs/infowindows/#how-can-i-use-cartojs-to-create-and-style-infowindows) for an overview of how to create infowindows.

#### Returns

An infowindow object, see [sublayer.infowindow](http://docs.carto.com/carto-engine/carto-js/api-methods/#sublayerinfowindow)

#### Example

The following example displays how to enable infowindow interactivity with the "click" action. This is the default for infowindows.

{% highlight html %}
 cartodb.vis.Vis.addInfowindow(map, sublayer, ['cartodb_id', 'lat', 'lon', 'name'],{
  infowindowTemplate: $('#infowindow_template').html(),
  templateType: 'mustache'
  });
{% endhighlight %}

#### Example (Infowindow with Tooltip)

The following example displays how to enable infowindow interactivity with the mouse "hover" action. This is referred to as a tooltip, and is defined with [`vis.addOverlay`](http://docs.carto.com/carto-engine/carto-js/api-methods/#visaddoverlayoptions).

{% highlight html %}
layer.leafletMap.viz.addOverlay({
  type: 'tooltip',
  layer: sublayer,
  template: '<div class="cartodb-tooltip-content-wrapper"><img style="width: 100%" src={{_url}}>{{name}}, {{age}}, {{city}}, {{country}}</div>', 
  position: 'bottom|right',
  fields: [{ name: 'name' }]
  });
{% endhighlight %}

## Add a Search Button

If you want to add a search box to find data points on your map, you can add a custom searchbox with CARTO.js. Search results move the map to the specified location, based on your data.

Any `div` element can be used to specify a default block setting as part of the HTML code for your map. This section specifically describes how to include a searchbox on a map layer, and link it to your dataset using a SQL query.

**Note:** This is different from the [`cartodb.createVis`](https://carto.com/docs/carto-engine/carto-js/api-methods/#cartodbcreatevis) `search` function, which adds a search control to query location by CARTO’s default location data service providers.

#### Arguments

The following division block displays how to add a custom `searchbox` as part of your HTML `<style>` element:

{% highlight html %}
 <style>
  html, body,#map {
      width:100%; 
      height:100%; 
      padding: 0; 
      margin: 0;
      
    }
  div#searchbox{
    background-color: #d2eaef;
    opacity: 0.8;
    position: absolute;
    top: 10px;
    left: 50px;
    width: auto;
    height: auto;
    padding: 10px;
    display: block;
    z-index: 9000;

    }
    div#searchbox input{
      width: 200px;
    }
    div#results{
      background: #FFF;
    }
 </style>
   <link rel="stylesheet" 
      href="http://libs.cartocdn.com/cartodb.js/v3/3.15/themes/css/cartodb.css" />
{% endhighlight %}

#### Returns

A searchbox box is added as an object on your map. Now you can link the `searchbox` to the `<body>` element of your map, using a SQL query to your dataset. (Options may vary, depending on how you are requesting your data).

{% highlight html %}
 </head>
<body>
  <div id="map"></div>
  <div id="searchbox">
  <input type="text" name="ad" value="" id="ad" size="10" />
  <button type="button" id="searchButton">Search</button>

<script src="http://libs.cartocdn.com/cartodb.js/v3/3.15/cartodb.js"></script>
<script>
  var layer;
  var input;
  var map;
  function main() {

    var map = L.map('map', { 
              zoomControl: false,
              center: [41.390205, 2.154007],
              zoom: 4
            });
    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://carto.com/attributions">CARTO</a>'}).addTo(map);

    // add CARTO layer
        cartodb.createLayer(map,'https://team.cartodb.com/u/{username}/api/v2/viz/{api_key}/viz.json').addTo(map)
        .done(function(){
          $('#searchButton').click(function(){
            input = $( "#ad").val();
            console.log(input);
            var sql = new cartodb.SQL({ user: {'username' });
             sql.getBounds("SELECT * FROM world_table where name Ilike '" + input + 
             "'").done(function(bounds) {
             map.fitBounds(bounds)
            });

          });
        });
  }
  
  window.onload = main;

</script>
</body>
{% endhighlight %}

#### Example

The following example 

See this [bl.ock example](http://bl.ocks.org/oriolbx/1e3755a44583058f4b95) for how to add a searchbox to query your dataset.
