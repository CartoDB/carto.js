module.exports = function Error (error) {
  error = error || {};

  this.message = error.message || 'Unknown error';
  this.type = error.type || 'unknown';
  this.context = error.context;
};
