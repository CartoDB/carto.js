# CartoDB.js v4 Analysis & Filtering API

## Table of contents

- [Analysis API](#analysis-api)
- [Filtering API](#filtering-api)
- [Usage example](#usage-example)

## Analysis API

A dataview represents a view of the dataset of a layer. It allows
users of CartoDB.js to extract information from a layer for analysis
purposes. For example, the following example defines a dataview to analyse the distribution of the numeric values of a column using the Jenks natural breaks classification method:

```
var clusterDataview = cartodb.dataviews.create(layer, {
  type: 'cluster',
  column: 'price',
  method: 'jenks',
  clusters: 10
});

// Options are diferent for each type

```

An instance of dataview provides methods to extract the information about a specific kind of analysis (see documentation below).

### Defining dataviews

As we saw in the previous example, `cartodb.dataviews.create` defines a new dataview that is linked to a layer's dataset:

```
cartodb.dataviews.create(layer, options)
```

`type` should be one of the following:

 - `clusters`
 - `categories`
 - `aggregation`

### Dataview events

Dataviews trigger the following event that we can listen to.

#### `dataChange`

This event is triggered when the dataview has changed data.

```
dataview.on('dataChanged', function(dataview) {
  console.log('CLUSTERS:', dataview.getClusters());
  // We could use these clusters to render an histogram
});

```
Depending on the dataview (and layer) type, the data might change at any time and thus will trigger this event again (e.g. when a filter is applied, more on this later).

### Types of dataviews

#### cartodb.dataviews.ClustersDataView

Clustering is the task of grouping a set of objects in such a way that objects in the same group (called a cluster) are more similar (in some sense or another) to each other than to those in other groups (clusters) [(from wikipedia)](https://en.wikipedia.org/wiki/Cluster_analysis).

Use the `clusters` type, as follows:

```
var dataview = cartodb.dataviews.create(layer, {
  type: 'clusters',
  column: 'population' // The column whose values will be clustered
  cluster: 10, // Number of groups (clusters)
  method: 'jenks' // Optional
})
```

##### Options

|name|description|type|default|
|---|---|---|---|
|column*|name of the column|string|
|clusters*|number of clusters|number|
|method|clustering method|jenks|jenks|


##### Methods

`cartodb.dataviews.ClustersDataView#getClusters`

#### cartodb.dataviews.CategoriesDataView

Use the `categories` type, as follows:

```
var dataview = cartodb.dataviews.create(layer, {
  type: 'categories',
  column: 'population'
})
```

##### Options

|name|description|type|default|
|---|---|---|---|
|column*|name of the column|string|

##### Methods

`cartodb.dataviews.CategoriesDataView#getCategories`

`cartodb.dataviews.CategoriesDataView#search`

#### cartodb.dataviews.AggregationDataView

Use the `aggregation` type, as follows:

```
var dataview = cartodb.dataviews.create(layer, {
  type: 'aggregation',
  column: 'population',
  function: 'count'
})
```

###### Options

|name|description|type|default|
|---|---|---|---|
|column*|name of the column|string|
|function*|function that will be used to calculate the results|string: `count`, `max`,  `min`, `avg` ||

##### Methods

`cartodb.dataviews.AggregationDataView#getValue`

## Filtering API

### Creating filters

Filters can be created using:

`cartodb.filters.createFilter(type, options)`

Where type can be one of the following:

- `category`
- `range`
- `bbox`

### Adding filters to a layer

Multiple filters can be added to a particular `layer` using:

`layer.addFilter(filter)`

Here's a quick example of a filter that is added to a layer to only render/list cities with a population between 10000 and 100000 inhabitants.

```
var populationFilter = cartodb.filters.createFilter('range', {
  column: 'population'
});
layer.addFilter(populationFilter);
populationFilter.setRange({ min: 10000, max: 100000 });
```

### Types of filters

#### cartodb.filters.CategoryFilter

Type: `category`.

##### Options

|name|description|type|default|
|---|---|---|---|
|column*|name of the column|string||

##### Methods

**Methods**

`cartodb.filters.CategoryFilter.add(category)`

`cartodb.filters.CategoryFilter.remove(category)`

#### cartodb.filters.RangeFilter

Type: `range`.

##### Options

|name|description|type|default|
|---|---|---|---|
|column*|name of the column|string||

##### Methods

```
cartodb.filters.RangeFilter.setRange({
  min: minValue,
  max: maxValue 
});
```

#### cartodb.filters.BoundingBoxFilter

Type: `bbox`.

##### Options

|name|description|type|default|
|---|---|---|---|
|map*|map object|cartodb.Map||

##### Methods

```
cartodb.filters.BoundingBoxFilter.setBounds([
  [ southBound, westBound ],
  [ northBound, eastBound ]
]);
```

## Usage example

Here's some example code that shows how deep-insights.js could use this API to populate the information that is displayed in the widgets and filter.

```
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