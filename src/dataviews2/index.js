// TODO Heredar de formulaDataViewModel
function Formula(params) {
  var operation = params.operation;
  var source = params.source;

  source.addDataview(this);
}



module.exports = { Formula: Formula };
