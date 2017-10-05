/**
 * Transform a geographic point (lat,lon) into a pixel coordinates (x,y)
 * using the given [projection](https://developers.google.com/maps/documentation/javascript/3.exp/reference#Projection)
 */
function latLngToPixel (projection, latlng) {
  return projection.fromLatLngToPoint(latlng);
}

/**
 * Transform pixel coordinates (x,y) into geographic point (lat,lon)
 * using the given [projection](https://developers.google.com/maps/documentation/javascript/3.exp/reference#Projection)
 */
function pixelToLatLng (projection, point) {
  return projection.fromPointToLatLng(point);
}

module.exports = {
  latLngToPixel: latLngToPixel,
  pixelToLatLng: pixelToLatLng
};
