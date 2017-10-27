var _ = require('underscore');
var WindshaftError = require('./error');

var parseWindshaftErrors = function (response) {
  if (response.errors_with_context) {
    return _.map(response.errors_with_context, function (error) {
      return new WindshaftError(error);
    });
  }
  if (response.errors) {
    return [
      new WindshaftError({ message: response.errors[0] })
    ];
  }
  return [];
};

function getGlobalErrors (errors) {
  return _.find(errors, function (error) {
    return error.isGlobalError();
  });
}

module.exports = {
  parseWindshaftErrors: parseWindshaftErrors,
  getGlobalErrors: getGlobalErrors
};
