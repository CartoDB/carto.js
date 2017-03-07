var latLng = function (arr) {
  if (typeof arr[0] === 'number') {
    return L.latLng(arr[0], arr[1]);
  }
  else {
    return arr.map(latLng);
  }
};

module.exports = latLng;