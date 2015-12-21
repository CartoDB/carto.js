# CartoDB.js v4

## Table of contents

- [Analysis API](#analysis-api)
- [Filtering API](#filtering-api)

## Analysis API

A dataview represents a view of the dataset of a layer. It allows
users of CartoDB.js to extract information from a layer for analysis
purposes. For example, the following example defines a dataview to analyse the distribution of the numeric values of a column using the Jenks natural breaks classification method:

```
// TODO: Order of arguments
// TODO: Perhaps we can find a better name for dataview
var clusterDataview = cartodb.dataviews.create(layer, 'cluster', {
  column: 'price',
  method: 'jenks',
  clusters: 10
});

```

Dataviews provide methods to extract the information about the specific type of analysis, and they are agnostic about:

1. The source of the data.
2. The way the results of the analysis will be used.

When a new dataview is defined, CartoDB.js does some work internally before the analysis is ready. Defining dataviews using `layer#cartodb.dataviews.create` is therefore an asyncronous operation.

Luckly for us, dataviews trigger a series of events that we can listen to. Here's an example:

```
dataview.on('dataChange', function(dataview) {
  console.log('CLUSTERS:', dataview.getClusters());
});

```

### Defining dataviews

As we saw in the previous example, `cartodb.dataviews.create` defines a new dataview that is linked to a layer's dataset:

```
// TODO: Revisit arguments
cartodb.dataviews.create(layers, type, options)
```

`type` should be one of the following:

 - `clustering`
 - `categorization`
 - `aggregation`

### Dataview events

#### `dataChange`

This event is triggered when the dataview has changed data.

### Clustering

Clustering is the task of grouping a set of objects in such a way that objects in the same group (called a cluster) are more similar (in some sense or another) to each other than to those in other groups (clusters) [(from wikipedia)](https://en.wikipedia.org/wiki/Cluster_analysis).

Use the `clustering` type, as follows:

```
var dataview = cartodb.dataviews.create(layer, 'clustering', {
  column: 'population' // The column whose values will be clustered
  cluster: 10, // Number of groups (clusters)
  method: 'jenks' // Optional
})
```

The following **options** can be used:

|name|description|type|default|
|---|---|---|---|
|column*|name of the column|string|
|clusters*|number of clusters|number|
|method|clustering method|jenks \| wadus|jenks|


#### cartodb.ClustersDataView

**Methods**

`cartodb.ClustersDataView#getClusters`

### Categorization

Use the `categorization ` type, as follows:

```
var dataview = cartodb.dataviews.create(layer, 'categorization', {
  column: 'population'
})
```

The following **options** can be used:

|name|description|type|default|
|---|---|---|---|
|column*|name of the column|string|

#### cartodb.CategoriesDataView

**Methods**

`cartodb.CategoriesDataView#getCategories`
`cartodb.CategoriesDataView#search`

### Aggregation

Use the `aggregation` type, as follows:

```
var dataview = cartodb.dataviews.create(layer, 'aggregation', {
  column: 'population',
  function: 'count'
})
```

The following **options** can be used:

|name|description|type|default|
|---|---|---|---|
|column*|name of the column|string|
|function*|function that will be used to calculate the results|string: `count`, `max`,  `min`, `avg` ||

#### cartodb.dataviews.AggregationDataView

**Methods**

`cartodb.AggregationDataView#getValue`

## Filtering API

### Definining filters

cartodb.createVis
cartodb.createLayer
cartodb.createRangeFilter(layer, {...})

### Updating filters

- Category - Accept or reject certain values for a given column

```
var categoryFilter = cartodb.filters.createFilter('category', { column: 'city' });
layer.addFilter(categoryFilter);
categoryFilter.accept('Madrid');
categoryFilter.acceptAll();
categoryFilter.reject('Gijon');

layer.filters.add(filter)

```

- Range - Set max and min values for a given colucmn

```
var rangeFilter = cartodb.filters.createFilter('range', { column: 'city' });
layer.addFilter(rangeFilter);
rangeFilter.setRange({ min: 0, max: 1000 });
```

- Bounding box

```
var bboxFilter = cartodb.filters.createFilter('bbox', { map: map });
layer.addFilter(bboxFilter);
```

## TODO

- API Top level details:
  - DefineProperty
  - Top level API: cartodb.dataviews, cartodb.filters
  - Should we expose/reuse Backbone stuff? eg: layer.filters.add(filter) vs layer.addFilter(...)
- Document the Rest of the API in this doc
- Format of the docs


```
// Some sample code using the API to render a couple of widgets

// Inside a category widget model...

var datasetview = cartodb.datasetviews.create(layer, 'aggregation', { column: 'city' }); 
var categoryfilter = cartodb.filters.createFilter('category', { column: 'city' });

var widget = new CategoryWidgetModel({
  title: 'My widgets'
});

// Inside the category widget view...

this.datasetview.on('dataChange', this.render, this);

// Inside the category item view...

this.categoryFilter.accept(category);

```