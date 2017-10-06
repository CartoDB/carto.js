var Backbone = require('backbone');

var DataviewsCollection = Backbone.Collection.extend({
  isAnalysisLinkedToDataview: function (analysisModel) {
    return this.any(function (dataviewModel) {
      var sourceId = dataviewModel.getSourceId();
      return analysisModel.get('id') === sourceId;
    });
  }
});

module.exports = DataviewsCollection;
