var latLng = function (arr) {
  if (typeof arr[0] === 'number') {
    return { lat: arr[0], lng: arr[1] };
  }
  else {
    return arr.map(latLng);
  }
};

module.exports = latLng;