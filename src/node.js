if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = cartodb;
}
if (typeof window === 'undefined') {
  console.warning('cartodb.js is not supported as a node module but intended to be used in a browser environment');
}
