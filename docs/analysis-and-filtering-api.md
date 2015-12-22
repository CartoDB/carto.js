# CartoDB.js v4 Analysis & Filtering API

## Table of contents

- [Analysis API](#analysis-api)
- [Filtering API](#filtering-api)
- [Usage example](#usage-example)

## Analysis API

A dataview represents a view of the dataset of a layer. It allows
users of CartoDB.js to extract information from a layer for analysis
purposes. For example, the following example defines a dataview to fetch the data that is required to render an histogram:

```
cartodb.dataviews.createHistogramDataView(layer, {
  column: 'price',
  clusters: 10
});
```

Creation of dataviews is an asynchronous operation, but dataviews trigger a `dataChange` event when the source of the data has changed (e.g. when the SQL of the layer has changed).

#### `dataChange`

```
dataview.on('dataChanged', function(dataview) {
  // Do something with the dataview
});
```

Depending on the dataview (and layer) type, the data might change at any time and thus will trigger this event again (e.g. when a filter is applied, more on this later).

### Types of dataviews

#### cartodb.dataviews.HistogramDataView

```
var dataview = cartodb.dataviews.createHistogramDataview(layer, {
  column: 'population',
  bins: 10, // Number of bins
})
```

##### Options

|name|description|type|default|
|---|---|---|---|
|column*|name of the column|string|
|bins*|number of bins|number|


##### Methods

`cartodb.dataviews.HistogramDataView#getHistogram`

#### cartodb.dataviews.CategoriesDataView

```
var dataview = cartodb.dataviews.createCategoriesDataview(layer, {
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

#### cartodb.dataviews.FormulaDataView

```
var dataview = cartodb.dataviews.createFormulaDataview(layer, {
  column: 'population',
  function: 'count'
})
```

##### Options

|name|description|type|default|
|---|---|---|---|
|column*|name of the column|string|
|function*|function that will be used to calculate the results|string: `count`, `max`,  `min`, `avg` ||

##### Methods

`cartodb.dataviews.FormulaDataView#getValue`
