var _ = require('underscore');
var AnalysisService = require('../../../analysis/analysis-service');

/**
 * Return a payload with the serialization of all the filters
 * 
 */
function serialize (layersCollection, dataviewsCollection) {
  var analysisList = AnalysisService.getAnalysisList(layersCollection, dataviewsCollection);
  return _serializeFilterFromAnalyses(analysisList);
}

function _serializeFilterFromAnalyses (analyses) {
  return analyses.reduce(function (filters, analysisModel) {
    var serializedFilters = analysisModel.getFilters().map(function (filter) {
      return filter.isEmpty()
        ? null
        : filter.toJSON();
    });

    var compactFilters = _.compact(serializedFilters);

    if (compactFilters.length > 0) {
      filters.analyses = filters.analyses || {};
      filters.analyses[analysisModel.id] = compactFilters;
    }

    return filters;
  }, {});
}

module.exports = {
  serialize: serialize
};
