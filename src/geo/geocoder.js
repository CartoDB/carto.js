

/**
 * geocoders for different services
 *
 * should implement a function called geocode the gets
 * the address and call callback with a list of placemarks with lat, lon
 * (at least)
 */

cdb.geo.geocoder.YAHOO = {

  keys: {
    app_id: ''
  },

  geocode: function (address, callback) {
    console.warn('YAHOO geocoding service is deprecated. Please use MAPBOX geocoding provider `cdb.geo.geocoder.MAPBOX`');
  }
};

cdb.geo.geocoder.MAPZEN = {
  keys: {
    app_id: ''
  },

  geocode: function (address, callback) {
    console.warn('MAPZEN geocoding service is deprecated. Please use MAPBOX geocoding provider `cdb.geo.geocoder.MAPBOX`');
  }
};


cdb.geo.geocoder.NOKIA = {

  keys: {
    app_id: '',
    app_code: ''
  },

  geocode: function (address, callback) {
    console.warn('HERE geocoding service is deprecated. Please use MAPBOX geocoding provider `cdb.geo.geocoder.MAPBOX`');
  }
};


cdb.geo.geocoder.MAPBOX = {
  keys: {
    access_token: 'pk.eyJ1IjoiY2FydG8tdGVhbSIsImEiOiJjamNseTl3ZzQwZnFkMndudnIydnJoMXZxIn0.HycQBkaaV7ZwLkHm5hEmfg',
  },

  TYPES : {
    country: 'country',
    region: 'region',
    postcode: 'postal-area',
    district: 'localadmin',
    place: 'venue',
    locality: 'locality',
    neighborhood: 'neighbourhood',
    address: 'address',
    poi: 'venue',
    'poi.landmark': 'venue'
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

    $.getJSON(protocol + '//api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(address) + '.json?access_token=' + this.keys.access_token, function (response) {
      callback(this._formatResponse(response));
    }.bind(this));
  },

  // Transform a raw response into a array with the cartodb format
  _formatResponse: function (rawResponse) {
    if (!rawResponse.features.length) {
      return [];
    }

    return [
      {
        lat: rawResponse.features[0].center[1],
        lon: rawResponse.features[0].center[0],
        type: this.TYPES[rawResponse.features[0].type] || 'default',
        title: rawResponse.features[0].text,
      }
    ];
  }
};