# Specific UI Functions

There are a few functions in CartoDB.js for creating, enabling, and disabling pieces of the user interface.

## vis.addOverlay(tooltip)

A tooltip is an infowindow that appears when you hover your mouse over a map feature with [`vis.addOverlay(options)`](http://docs.cartodb.com/cartodb-platform/cartodb-js/api-methods/#visaddoverlayoptions). You can customize the placement of your tooltip by modifying the `position` values.

#### Example

```javascript
var tooltip = vis.addOverlay({
  type: 'tooltip',
  template: '<p>{{variable}}</p>' // mustache template
  width: 200,
  position: 'bottom|right',
  fields: [{ name: 'name', population: 'pop2005' }]
});
```
**Note:** If you are using `createLayer` for a map object that contains an enabled tooltip, you can disable the tooltip by applying the `false` value. See the [`cartodb.createLayer(map, layerSource [, options] [, callback])](http://docs.cartodb.com/cartodb-platform/cartodb-js/api-methods/#arguments-2) `tooltip` description for how to enable/disable an interactive tooltip.

## vis.addOverlay(infobox)

Displays a small box when the user hovers on a map feature. This is similar to a tooltip but does not contain any positioning options. _The position is fixed, and always appears in the same position_.

#### Example

****** NEED NEW CODE EXAMPLE, INFOBOX SHOULD NOT HAVE POSITION OPTIONS? *****

```javascript
var box = vis.addOverlay({
  type: 'infobox',
  template: '<p>{{name_to_display}}</p>',
  width: 200, // width of the box
  position: 'bottom|right' // top, bottom, left and right are available
});
```
## cartodb.vis.Vis.addInfowindow(_map, layer, fields [, options]_)

Infowindows provide additional interactivity for your published map, controlled by layer events. It enables interaction and overrides the layer interactivity. A pop-up information window appears when a viewer clicks, or hovers their mouse over, select data on your map. 

#### Arguments

Option | Description
--- | ---
map | native map object or leaflet.
layer | cartodb layer (or sublayer).
fields | array of column names.<br /><br />**Note:** This tells CartoDB what columns from your dataset should appear in your infowindow.
options | 
--- | ---
&#124;_ infowindowTemplate | allows you to set the HTML of the template.
&#124;_templateType | indicates the type of template ([`Mustache` template](http://mustache.github.io/mustache.5.html) or `Underscore` template placeholders).

**Tip:** See [How can I use CartoDB.js to create and style infowindows?](http://docs.cartodb.com/faqs/infowindows/#how-can-i-use-cartodbjs-to-create-and-style-infowindows) for an overview of how to create infowindows.

#### Returns

An infowindow object, see [sublayer.infowindow](http://docs.cartodb.com/cartodb-platform/cartodb-js/api-methods/#sublayerinfowindow)

#### Example

The following example displays how to enable infowindow interactivity with the "click" action. This is the default for infowindows.

{% highlight html %}
 cartodb.vis.Vis.addInfowindow(map, sublayer, ['cartodb_id', 'lat', 'lon', 'name'],{
  infowindowTemplate: $('#infowindow_template').html(),
  templateType: 'mustache'
  });
{% endhighlight %}

#### Example (Infowindow with Tooltip)

The following example displays how to enable infowindow interactivity with the mouse "hover" action. This is referred to as a tooltip, and is defined with [`vis.addOverlay`](http://docs.cartodb.com/cartodb-platform/cartodb-js/api-methods/#visaddoverlayoptions).

{% highlight html %}
layer.leafletMap.viz.addOverlay({
  type: 'tooltip',
  layer: sublayer,
  template: '<div class="cartodb-tooltip-content-wrapper"><img style="width: 100%" src={{_url}}>{{name}}, {{age}}, {{city}}, {{country}}</div>', 
  position: 'bottom|right',
  fields: [{ name: 'name' }]
  });
{% endhighlight %}

## vis.addOverlay(zoom)

 Zoom control buttons enable you to adjust the zoom level on the map image, by using the increase size (+) or decrease (-) buttons. The position of the zoom control buttons are fixed, and located on the top-left of the map. Zoom control buttons are enabled by default.

 IS IT TRUE THAT THE ZOOM CONTROL POSITION IS FIXED????

#### Examples

```javascript
vis.addOverlay({ type: 'zoom' });
```
Example of vis.getOverlay(zoom)? Code is different?
http://docs.cartodb.com/cartodb-platform/cartodb-js/api-methods/#example-1

**Note:** If you are using `createLayer` for a map object that contains an enabled zoom control, you can disable the zoom control by applying the `false` value. See the [`cartodb.createLayer(map, layerSource [, options] [, callback])](http://docs.cartodb.com/cartodb-platform/cartodb-js/api-methods/#arguments-2) `zoomControl` description for how to enable/disable the zoom control.

## cartodb.createLayer() ui functions

??? Add any other ui functions? For createLayer= Search box, scrollwheel, cartodb logo, legends, etc.? All these arguments? [http://docs.cartodb.com/cartodb-platform/cartodb-js/api-methods/#arguments](http://docs.cartodb.com/cartodb-platform/cartodb-js/api-methods/#arguments)???
