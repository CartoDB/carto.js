# CARTO.js


## Table of contents

1. Authentication / permissions
2. Dashboards
3. Maps
4. Layers
6. Widgets
7. Sources / Analysis
8. Errors


Here's a hierarchy with some of the most important classes in CARTO.js:


```
carto.Dashboard
    ├── carto.Map
    │    ├── carto.layer.Layers
    │    │   ├── carto.layer.DataLayer
    │    │   │    └── carto.source.SQLSource
    │    │   ├── carto.layer.AnimatedDataLayer
    │    │   ├── carto.layer.LeafletBaseLayer
    │    │   └── carto.layer.GoogleMapsBaseLayer
    │    ├── carto.control.Control
    │    │   ├── carto.control.ZoomControl
    │    │   ├── carto.control.SearchControl
    │    │   ├── carto.control.AttributionControl
    │    └── carto.overlay.Overlays
    │        ├── carto.overlay.Overlay
    │        ├── carto.overlay.FeatureClickPopup
    │        └── carto.overlay.FeatureOverPopup
    └── carto.widget.Widgets
        ├── carto.widget.CategoryWidget
        ├── carto.widget.HistogramWidget
        ├── carto.widget.FormulaWidget
        ├── carto.widget.ListWidget
        └── carto.widget.CustomWidget?
```


## 1. Authentication / permissions

To use the new API, you will first need to create an API key in [carto.com](http://carto.com). You will be able to customise the permissions for each of the API keys you generate.

To set the API key that CARTO.js will use:

```
carto.setApiKey('YOUR_API_KEY');
```

If no API key is given or the key doesn't have permissions to execute an operation...

TODO: Exception? Error event?

## 2.Dashboards

### carto.Dashboard

#### Create

```
// This will create a new dashboard in the server.
var dashboard = new carto.Dashboard ({
  container: '#dashboard', // selector or dom element
  options: { ... }, // see carto.DashboardOptions
  map: map, // a carto.map.Map
  widgets: [ myWidget1, myWidget2 ] // see carto.widget.Widget
});

```

#### Read

```
dashboard.getOptions();

// TODO vv: status? sync status? do we need status at all?
dashboard.getStatus();
dashboard.getErrors(); // carto.error.DashboardError

// Map
dashboard.getMap();

// Widgets
dashboard.getWidgets(); // array of carto.widget.Widget
dashboard.getWidget(widgetId); // a carto.widget.Widget
```

#### Update

```
dashboard.reload(); // creates a new dashboard in the server
dashboard.setOptions(options);

// Map
dashboard.setMap(map);

// Widgets
dashboard.addWidget(myWidget);
dashboard.removeWidget(myWidget);
dashboard.setWidgets([ myWidget ]);


```

#### Delete

```
dashboard.remove();
```

#### Events

- `loading`: dashboard is loading
- `load`: dashboard is loaded
- `error`: there was an error when loading the map

TODO: ^^ what errors? eg: sync error?, runtime JS errors?


### carto.DashboardOptions

| name                   | desc                             |
|------------------------|----------------------------------|
| showToolbar            | true OR false. Default: true     |

## 3. Maps

### carto.Map

#### Create

```
var map = new carto.Map({
  container: '#map', // selector or a dom element, not required, an element will be created if not present
  options: {  // see carto.MapOptions
    center: new carto.LatLng(0, 0),
    zoom: 10
  },
  layers: [ baseLayer, dataLayer, labelsLayer]
});
```

#### Read

```
map.getOptions();
map.getCenter();
map.getZoom();
map.getContainer();
map.getLayers(); // array of carto.layer.Layer
map.getLayer(layerId); // a carto.layer.Layer
map.getLayerAt(x); // a carto.layer.Layer
```

#### Update
```
map.setOptions(options);
map.setCenter(latLng);
map.setZoom(10);
map.setContainer(container);

// layers
map.addLayer(myLayer);
map.removeLayer(myLayer);
map.setLayers([ myLayer1, myLayer2 ]);

// overlays
map.addOverlay(myOverlay);
map.removeOverlay(myOverlay);
map.setOverlays([ myOverlay1, myOverlay2 ]);


// controls
map.addControl(myControl);
map.removeControl(myControl);
map.setControls([ myControl1 , myControl2 ]);

```

#### Delete
```
map.remove();
```

#### Drawing geometries

TODO

#### Managing geometries

TODO

### carto.MapOptions

| name              | desc                             |
|-------------------|----------------------------------|
| center            | carto.LatLng. Default: [0, 0]    |
| zoom              | zoom level. Default: 4           |
| scrollwheel       | true OR false. Default: true     |
| showSearch        | true OR false. Default: true     |
| showZoom          | true OR false. Default: true     |
| showLayerSelector | true OR false. Default: true     |

## 4.Layers

### carto.layer.Layer

Base layer for all layers.

#### Create

Use any of the subtypes.

#### Read

```
layer.isVisible();
layer.getOpacity();
```

#### Update

```
layer.hide();
layer.show();
layer.setOpacity(0.5);

```

#### Delete

Deleted via `Map#deleteLayer`.

### carto.layer.DataLayer

#### Create

```
var dataLayer = new carto.layer.DataLayer({
  source: aSource,
  style: aStyle
});
map.addLayer(dataLayer);

```
#### Read

```
dataLayer.getSource();
dataLayer.getStyle();
```

#### Update

```
dataLayer.setSource();
dataLayer.setStyle();
```

### carto.layer.animatedDataLayer

A dataLayer that is animated (torque). There can only be one animated data layer. It'll always be displayed on top of other data layers, and below the labels if the basemap has labels. Inherits from `carto.layer.DataLayer`.

#### Create

// TODO: steps? 
```
var animatedDataLayer = new carto.layer.AnimatedDataLayer({
  source: aSource,
  style: aStyle
});
map.addLayer(animatedDataLayer);

```

#### Read


```
animatedDataLayer.isPlaying();
animatedDataLayer.isPaused();
```

#### Update

```
animatedDataLayer.play();
animatedDataLayer.pause();
animatedDataLayer.setStep(10);
```

## 7. Sources / Analysis


### carto.source.SQLQuery

```
var cities = new carto.source.SQLQuery("SELECT * FROM cities");
```

### carto.source.analysis.AreasOfInterest

