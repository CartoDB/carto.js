var AnalysisModel = require('../../../analysis/analysis-model');
var CamshaftReference = require('../../../analysis/camshaft-reference');

function SQL (id, query, engine) {
  return new AnalysisModel({
    id: id,
    type: 'source',
    query: query
  }, {
    camshaftReference: CamshaftReference,
    engine: engine
  });
}

module.exports = SQL;
