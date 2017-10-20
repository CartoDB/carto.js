var AnalysisModel = require('../../analysis/analysis-model');
var CamshaftReference = require('../../analysis/camshaft-reference');

function Analysis (type, inputs, params) {
  this._analysis = new AnalysisModel({
    type: type

  }, {
    camshaftReference: CamshaftReference,
    vis: {
      reload: function () {

      }
    }
  });
}

Analysis.Source = function (id, query) {
  return new AnalysisModel({
    id: id,
    type: 'source',
    query: query
  }, {
    camshaftReference: CamshaftReference,
    vis: {
      reload: function () {

      }
    }
  });
};

module.exports = Analysis;
