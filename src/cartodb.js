var isLeafletAlreadyLoaded = !!window.L;
var v4 = require('./api/v4');
var L = require('leaflet');
require('mousewheel'); // registers itself to $.event; TODO what's this required for? still relevant for supported browsers?
require('mwheelIntent'); // registers itself to $.event; TODO what's this required for? still relevant for supported browsers?

var cdb = require('cdb');
if (window) {
  window.cartodb = window.cdb = window.carto = cdb;
}

if (isLeafletAlreadyLoaded) L.noConflict();

cdb.core = {};
cdb.core.sanitize = require('./core/sanitize');
cdb.core.Template = require('./core/template');
cdb.core.Model = require('./core/model');
cdb.core.View = require('./core/view');

cdb.SQL = require('./api/sql');

cdb.createVis = require('./api/create-vis');

// Expose v4 API
cdb.core = v4.core;
cdb.layer = v4.layer;
cdb.source = v4.source;
cdb.style = v4.style;

window.carto = cdb;
// log cartodb.js version
var logger = require('cdb.log');
logger.log('cartodb.js ' + cdb.VERSION);

cdb.helpers.GeoJSONHelper = require('./geo/geometry-models/geojson-helper');

module.exports = cdb;
