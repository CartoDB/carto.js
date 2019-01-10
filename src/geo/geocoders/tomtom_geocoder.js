cdb.geo.geocoder.TOMTOM = {
  keys: {
    api_key: 'vrZphqNRlSCiU0J0ky0tFQGd0Pfbjxhr'
  },

  TYPES: {
    'Geography': 'region',
    'Geography:Country': 'country',
    'Geography:CountrySubdivision': 'region',
    'Geography:CountrySecondarySubdivision': 'region',
    'Geography:CountryTertiarySubdivision': 'region',
    'Geography:Municipality': 'localadmin',
    'Geography:MunicipalitySubdivision': 'locality',
    'Geography:Neighbourhood': 'neighbourhood',
    'Geography:PostalCodeArea': 'postal-area',
    'Street': 'neighbourhood',
    'Address Range': 'neighbourhood',
    'Point Address': 'address',
    'Cross Street': 'address',
    'POI': 'venue'
  },

  geocode: function (address, callback) {
    address = address.toLowerCase()
      .replace(/é/g, 'e')
      .replace(/á/g, 'a')
      .replace(/í/g, 'i')
      .replace(/ó/g, 'o')
      .replace(/ú/g, 'u');

    var protocol = '';
    if (location.protocol.indexOf('http') === -1) {
      protocol = 'http:';
    }

    var tomtomVersion = '2';
    var url = protocol + '//api.tomtom.com/search/' + tomtomVersion + '/search/' + encodeURIComponent(address) + '.json?key=' + this.keys.api_key;

    $.getJSON(url, function (response) {
      callback(this._formatResponse(response));
    }.bind(this));
  },

  /**
   * Transform a tomtom geocoder response into an object more friendly for our search widget.
   * @param {object} rawTomTomResponse - The raw tomtom geocoding response, {@see https://developer.tomtom.com/search-api/search-api-documentation-geocoding/geocode}
   */
  _formatResponse: function (rawResponse) {
    if (!rawResponse.results.length) {
      return [];
    }

    var bestCandidate = rawResponse.results[0];

    return [{
      boundingbox: this._getBoundingBox(bestCandidate),
      center: this._getCenter(bestCandidate),
      type: this._getType(bestCandidate)
    }];
  },

  /**
   * TomTom returns { lon, lat } while we use [lat, lon]
   */
  _getCenter: function (result) {
    return [result.position.lat, result.position.lon];
  },

  /**
   * Transform the feature type into a well known enum.
   */
  _getType: function (result) {
    var type = result.type;

    if (this.TYPES[type]) {
      if (type === 'Geography' && result.entityType) {
        type = type + ':' + result.entityType;
      }
      return this.TYPES[type];
    }

    return 'default';
  },

  /**
   * Transform the feature bbox into a carto.js well known format.
   */
  _getBoundingBox: function (result) {
    if (!result.viewport) {
      return;
    }
    var upperLeft = result.viewport.topLeftPoint;
    var bottomRight = result.viewport.btmRightPoint;

    return {
      south: bottomRight.lat,
      west: upperLeft.lon,
      north: upperLeft.lat,
      east: bottomRight.lon
    };
  }
};