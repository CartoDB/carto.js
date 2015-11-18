var _ = require('underscore');
var Vis = require('../vis/vis');

/**
 * Allowed options for `createVis` method.
 * @typedef {Object} CreateVisOptions
 * @property {bool} shareable   Add facebook and twitter share buttons.
 * @property {String} title     Adds a header with the title of the visualization.
 * @property {String} description   Adds description to the header (as you set in the UI).
 * @property {bool} search    Adds a search control (default: true).
 * @property {bool} zoomControl   Adds zoom control (default: true).
 * @property {bool} loaderControl   Adds loading control (default: true).
 * @property {Number} center_lat    Latitude where the map is initializated.
 * @property {Number} center_lon    Longitude where the map is initializated.
 * @property {Number} zoom    Initial zoom.
 * @property {bool} cartodb_logo  Default to true, set to false if you want to remove the cartodb logo.
 * @property {bool} infowindow    Set to false if you want to disable the infowindow (enabled by default).
 * @property {bool} time_slider   Show time slider with torque layers (enabled by default).
 * @property {bool} layer_selector  Show layer selector (default: false).
 * @property {bool} legends     If it's true legends are shown in the map.
 * @property {bool} https       If true, it makes sure that basemaps are converted to https when possible. If explicitly false, converts https maps to http when possible. If undefined, the basemap template is left as declared at `urlTemplate` in the viz.json.
 * @property {bool} scrollwheel   Enable/disable the ability of zooming using scrollwheel (default enabled)
 * @property {bool} fullscreen    If true adds a button to toggle the map fullscreen
 * @property {bool} mobile_layout   If true enables a custom layout for mobile devices (default: false)
 * @property {bool} force_mobile  Forces enabling/disabling the mobile layout (it has priority over mobile_layout argument)
 * @property {String} gmaps_base_type   Use Google Maps as map provider whatever is the one specified in the viz.json". Available types: 'roadmap', 'gray_roadmap', 'dark_roadmap', 'hybrid', 'satellite', 'terrain'.
 * @property {Object} gmaps_style       Google Maps styled maps. See [documentation](https://developers.google.com/maps/documentation/javascript/styling).
 * @property {bool} no_cdn    True to disable CDN when fetching tiles
 */

/**
 * Creates a visualization inside the map_id DOM object.
 *
 * @param  {HTMLElement}   el       [description]
 * @param  {URL|Object}   vizjson  Information in vizjson format to create the visualization.
 * @param  {CreateVisOptions}   options  [description]
 * @param  {Vis~DoneCallback} callback Function called once the visualization is created,
 * passing `vis` and `layers` as arguments: `callback(vis,layers)`
 * @return {Vis}  New Vis instance.
 */
var createVis = function(el, vizjson, options, callback) {

  if (!el) {
    throw new TypeError("a DOM element should be provided");
  }

  var
  args = arguments,
  fn   = args[args.length -1];

  if (_.isFunction(fn)) {
    callback = fn;
  }

  el = (typeof el === 'string' ? document.getElementById(el) : el);

  var vis = new Vis({ el: el });

  if (vizjson) {

    vis.load(vizjson, options);

    if (callback) {
      vis.done(callback);
    }

  }

  return vis;

};

module.exports = createVis;
