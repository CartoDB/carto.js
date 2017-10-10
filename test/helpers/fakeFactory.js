var _ = require('underscore');
var VisModel = require('../../src/vis/vis');
var AnalysisModel = require('../../src/analysis/analysis-model');
var camshaftReference = require('../../src/analysis/camshaft-reference');

var fakeCamshaftReference = camshaftReference;

var createCamshaftReference = function () {
  return fakeCamshaftReference;
};

var createAnalysisModel = function (attrs, opts) {
  if (!_.has(attrs, 'type')) {
    attrs.type = 'source';
  }
  opts = opts || {};

  var model = new AnalysisModel(attrs, {
    camshaftReference: attrs.camshaftReference || createCamshaftReference(),
    vis: opts.vis || createVisModel()
  });

  return model;
};

var createVisModel = function () {
  var vis = new VisModel();
  vis.reload = jasmine.createSpy('reload');
  return vis;
};

module.exports = {
  createAnalysisModel: createAnalysisModel,
  createVisModel: createVisModel,
  createCamshaftReference: createCamshaftReference
};
