var cartodb = window.cartodb;

/**
 * Checks if page is being served from a local file.
 * It'll return true for URLs, such as:
 *   - http://localhost:8000/examples/easy.html
 *   - file:///Users/foo/cartodb/cartodb.js/examples/easy.html
 * @return {boolean} True if page is served locally
 */
var pageServedLocally = function () {
  return window.location.protocol.indexOf('http') !== 0 ||
    window.location.hostname.indexOf('localhost') >= 0
};

var pageServedFromCartoServers = function () {
  return window.location.host.indexOf('carto.com') >= 0 ||
    window.location.host.indexOf('carto-staging.com') >= 0
};

var LogEventTracker = function () {};
LogEventTracker.prototype.trackEvent = function (eventName) {
  var event = [ 'cartodb.js', eventName, { eventLabel: window.location.href } ];
  console.log.apply(console, event);  
}

var GoogleAnalyticsEventTracker = function (trackingId) {
  this._analytics = require('universal-ga');
  this._analytics.initialize(trackingId);
}
GoogleAnalyticsEventTracker.prototype.trackEvent = function (eventName) {
  var event = [ 'cartodb.js', eventName, { eventLabel: window.location.href } ];
  this._analytics.event.apply(this._analytics, event);
}

var eventTracker;
if (pageServedLocally() || pageServedFromCartoServers()) {
  eventTracker = new LogEventTracker();
} else {
  var TRACKING_ID = 'UA-20934186-27';
  eventTracker = new GoogleAnalyticsEventTracker(TRACKING_ID);
}

// Decorate public API functions with event tracking

// cartodb.createVis
if (cartodb.hasOwnProperty('createVis')) {
  var originalCreateVis = cartodb.createVis;
  cartodb.createVis = function (el, vizjson, options, callback) {
    var eventName = 'cartodb.createVis';
    
    try {
      if (typeof vizjson === "string") {
        eventName += ' - viz.json (string)'
      } else {
        if (typeof vizjson === 'object') {
          if (vizjson.hasOwnProperty('id') || vizjson.hasOwnProperty('version')) {
            eventName += ' - viz.json (object)'
          }
        }
      }
    } catch (error) {
      eventName += ' - error: ' + error.message
    }

    eventTracker.trackEvent(eventName);
    return originalCreateVis.apply(cartodb, arguments);
  };
}

// cartodb.createLayer
if (cartodb.hasOwnProperty('createLayer')) {
  var originalCreateLayer = cartodb.createLayer
  cartodb.createLayer = function (map, layerSource, options, callback) {
    var eventName = 'cartodb.createLayer';

    try {
      if (typeof layerSource === "string") {
        eventName += ' - viz.json (string)'
      } else {
        if (typeof layerSource === 'object') {
          if (layerSource.hasOwnProperty('id') || layerSource.hasOwnProperty('version')) {
            eventName += ' - viz.json (object)'
          } else if (layerSource.hasOwnProperty('sublayers')) {
            eventName += ' - viz.json (sublayers)'
          }
        }
      }
    } catch (error) {
      eventName += ' - error: ' + error.message
    }

    eventTracker.trackEvent(eventName);
    return originalCreateLayer.apply(cartodb, arguments);
  };
}

// cartodb.SQL#execute
if (cartodb.hasOwnProperty('SQL')) {
  var originalSQLExecute = cartodb.SQL.prototype.execute;
  cartodb.SQL.prototype.execute = function(sql, vars, options, callback) {
    var eventName = 'cartodb.SQL#execute'
    
    eventTracker.trackEvent(eventName);
    return originalSQLExecute.apply(this, arguments);
  };
}

// cartodb.Tiles.getTiles;
if (cartodb.hasOwnProperty('Tiles')) {
  var originalTilesGetTiles = cartodb.Tiles.getTiles;
  cartodb.Tiles.getTiles = function(options, callback) {
    var eventName = 'cartodb.Tiles.getTiles'
    
    eventTracker.trackEvent(eventName);
    return originalTilesGetTiles.apply(cartodb, arguments);
  };
}

// cartodb.Image;
if (cartodb.hasOwnProperty('Image')) {
  var originalImage = cartodb.Image;
  cartodb.Image = function(data, options) {
    var eventName = 'cartodb.Image'
    
    eventTracker.trackEvent(eventName);
    return originalImage.apply(this, arguments);
  };
}
