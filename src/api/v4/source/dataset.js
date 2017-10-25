var AnalysisModel = require('../../../analysis/analysis-model');
var CamshaftReference = require('../../../analysis/camshaft-reference');

function Dataset (id, name, engine) {
  return new AnalysisModel({
    id: id,
    type: 'source',
    query: 'SELECT * FROM ' + name
  }, {
    camshaftReference: CamshaftReference,
    engine: engine
  });
}

module.exports = Dataset;
