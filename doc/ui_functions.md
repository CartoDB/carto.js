# Specific UI functions

There are a few functions in CartoDB.js for creating, enabling, and disabling pieces of the user interface.

## cartodb.geo.ui.Tooltip

Shows a small tooltip on hover:

```javascript
var tooltip = vis.addOverlay({
  type: 'tooltip',
  template: '<p>{{variable}}</p>' // mustache template
});
```

### cartodb.geo.ui.Tooltip.enable()

The tooltip is shown when hover on feature when is called.

### cartodb.geo.ui.Tooltip.disable()

The tooltip is not shown when hover on feature.

---

## cartodb.geo.ui.InfoBox

Shows a small box when the user hovers on a map feature. The position is fixed:

```javascript
var box = vis.addOverlay({
  type: 'infobox',
  template: '<p>{{name_to_display}}</p>',
  width: 200, // width of the box
  position: 'bottom|right' // top, bottom, left and right are available
});
```

### cartodb.geo.ui.InfoBox.enable()

The tooltip is shown when hover on feature.

### cartodb.geo.ui.InfoBox.disable()

The tooltip is not shown when hover on feature.

---

## cartodb.vis.Vis.addInfowindow(_map, layer, fields [, options]_)

Infowindows provide additional interactivity for your published map, controlled by layer events. It enables interaction and overrides the layer interactivity. A pop-up information window appears when a viewer clicks, or hovers their mouse over, select data on your map. 

_**Note:** By default, the `cdb.vis.Vis.addInfowindow` code triggers interactivity for the infowindow with the "click" action. If you are using the "[hover](http://docs.cartodb.com/cartodb-platform/cartodb-js/api-methods/#visaddoverlayoptions)" action, you will still have to define the infowindow options with `cbd.vis.Vis.addInfowindow`, and specify additional parameters for the hover action with the `vis.Overlays` code._

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

**Tip:** See [How can I use CartoDB.js to create and style infowindows?](/faqs/infowindows/#how-can-i-use-cartodb.js-to-create-and-style-infowindows) for an overview of how to create infowindows.

#### Returns

An infowindow object, see [sublayer.infowindow](#sublayerinfowindow)

#### Example

The following example displays how to enable infowindow interactivity with the "click" action. This is the default for infowindows.

{% highlight html %}
 cartodb.vis.Vis.addInfowindow(map, sublayer, ['cartodb_id', 'lat', 'lon', 'name'],{
  infowindowTemplate: $('#infowindow_template').html(),
  templateType: 'mustache'
  });
{% endhighlight %}

#### Example (Infowindow with Tooltip)

The following example displays how to enable infowindow interactivity with the mouse "hover" action. This is referred to as a tooltip, as is defined with [`vis.addOverlay`](#visaddoverlayoptions).

{% highlight html %}
layer.leafletMap.viz.addOverlay({
  type: 'tooltip',
  layer: sublayer,
  template: '<div class="cartodb-tooltip-content-wrapper"><img style="width: 100%" src={{_url}}>{{name}}, {{age}}, {{city}}, {{country}}</div>', 
  position: 'bottom|right',
  fields: [{ name: 'name' }]
  });
{% endhighlight %}

---

## cartodb.geo.ui.Zoom

Shows the zoom control:

```javascript
vis.addOverlay({ type: 'zoom' });
```

### cartodb.geo.ui.Zoom.show()

### cartodb.geo.ui.Zoom.hide()
