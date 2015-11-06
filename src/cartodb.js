var isLeafletAlreadyLoaded = !!window.L;

var _ = require('underscore');
var L = require('leaflet');
require('mousewheel'); // registers itself to $.event; TODO what's this required for? still relevant for supported browsers?
require('mwheelIntent'); // registers itself to $.event; TODO what's this required for? still relevant for supported browsers?

var cdb = require('cdb');
cdb.Backbone = require('backbone');
cdb.Mustache = require('mustache');
cdb.$ = require('jquery');
cdb._ = _;
cdb.L = L;

if (isLeafletAlreadyLoaded) L.noConflict();
_.extend(L, require('./geo/leaflet-extensions'));
_.extend(cdb.geo, require('./geo/leaflet'));

cdb.Image = require('./vis/image')
cdb.SQL = require('./api/sql');

cdb.config = require('cdb.config');
cdb.log = require('cdb.log');
cdb.errors = require('cdb.errors');
cdb.templates = require('cdb.templates');
cdb.decorators = require('./core/decorators');
cdb.createVis = require('./api/create-vis');
cdb.createLayer = require('./api/create-layer');

// Extracted from vis/vis.js,
// used in libs like torque and odyssey to add themselves here (or so it seems)
cdb.moduleLoad = function(name, mod) {
  cdb[name] = mod;
  cdb.config.modules.add({
    name: name,
    mod: mod
  });
};

cdb.core.Profiler = require('cdb.core.Profiler');
cdb.core.util = require('cdb.core.util');
cdb.core.Loader = cdb.vis.Loader = require('./core/loader');
cdb.core.sanitize = require('./core/sanitize')
cdb.core.Template = require('./core/template');
cdb.core.TemplateList = require('./core/template-list');
cdb.core.Model = require('./core/model');
cdb.core.View = require('./core/view');

cdb.ui.common.Dialog = require('./ui/common/dialog');
cdb.ui.common.ShareDialog = require('./ui/common/share');
cdb.ui.common.Dropdown = require('./ui/common/dropdown');
cdb.ui.common.FullScreen = require('./ui/common/fullscreen');
cdb.ui.common.Notification = require('./ui/common/notification');
cdb.ui.common.Row = require('./ui/common/table/row');
cdb.ui.common.TableData = require('./ui/common/table/table-data');
cdb.ui.common.TableProperties = require('./ui/common/table/table-properties');
cdb.ui.common.RowView = require('./ui/common/table/row-view');
cdb.ui.common.Table = require('./ui/common/table');

cdb.geo.common.CartoDBLogo = require('./geo/cartodb-logo');

cdb.geo.geocoder.NOKIA = require('./geo/geocoder/nokia-geocoder');
cdb.geo.geocoder.YAHOO = require('./geo/geocoder/yahoo-geocoder');
cdb.geo.Geometry = require('./geo/geometry');

cdb.geo.MapLayer = require('./geo/map/map-layer');
cdb.geo.TileLayer = require('./geo/map/tile-layer');
cdb.geo.GMapsBaseLayer = require('./geo/map/gmaps-base-layer');
cdb.geo.WMSLayer = require('./geo/map/wms-layer');
cdb.geo.PlainLayer = require('./geo/map/plain-layer');
cdb.geo.TorqueLayer = require('./geo/map/torque-layer');
cdb.geo.CartoDBLayer = require('./geo/map/cartodb-layer');
cdb.geo.CartoDBNamedMapLayer = require('./geo/map/cartodb-named-map-layer');
cdb.geo.Layers = require('./geo/map/layers');
cdb.geo.CartoDBGroupLayer = require('./geo/map/cartodb-group-layer');
cdb.geo.Map = require('./geo/map');
cdb.geo.MapView = require('./geo/map-view');

_.extend(cdb.geo, require('./geo/gmaps'));

// overwrites the Promise defined from the core bundle
cdb.Promise = require('./api/promise');

cdb.geo.ui.Text = require('./geo/ui/text');
cdb.geo.ui.Annotation = require('./geo/ui/annotation');
cdb.geo.ui.Image = require('./geo/ui/image');
cdb.geo.ui.Share = require('./geo/ui/share');
cdb.geo.ui.Zoom = require('./geo/ui/zoom');
cdb.geo.ui.ZoomInfo = require('./geo/ui/zoom-info');

// setup expected object structure here, to avoid circular references
_.extend(cdb.geo.ui, require('./geo/ui/legend-exports'));
cdb.geo.ui.Legend = require('./geo/ui/legend');
_.extend(cdb.geo.ui.Legend, require('./geo/ui/legend/legend-view-exports'));

cdb.geo.ui.InfowindowModel = require('./geo/ui/infowindow-model');
cdb.geo.ui.Infowindow = require('./geo/ui/infowindow');

cdb.geo.ui.SlidesControllerItem = require('./geo/ui/slides-controller-item');
cdb.geo.ui.SlidesController = require('./geo/ui/slides-controller');
cdb.geo.ui.Header = require('./geo/ui/header');

cdb.geo.ui.Search = require('./geo/ui/search');

cdb.geo.ui.LayerSelector = require('./geo/ui/layer-selector');
cdb.geo.ui.LayerView = require('./geo/ui/layer-view');
cdb.geo.ui.LayerViewFromLayerGroup = require('./geo/ui/layer-view-from-layer-group');

cdb.geo.ui.MobileLayer = require('./geo/ui/mobile-layer');
cdb.geo.ui.Mobile = require('./geo/ui/mobile');
cdb.geo.ui.TilesLoader = require('./geo/ui/tiles-loader');
cdb.geo.ui.InfoBox = require('./geo/ui/infobox');
cdb.geo.ui.Tooltip = require('./geo/ui/tooltip');

cdb.vis.INFOWINDOW_TEMPLATE = require('./vis/vis/infowindow-template');
cdb.vis.Overlay = require('./vis/vis/overlay');
cdb.vis.Overlays = require('./vis/vis/overlays');
cdb.vis.Layers = require('./vis/vis/layers');
cdb.vis.Vis = require('./vis/vis');
require('./vis/overlays'); // Overlay.register calls
require('./vis/layers'); // Layers.register calls


cdb.geo.ui.Widget.View = require('./geo/ui/widget');
cdb.geo.ui.Widget.Content = require('./geo/ui/widgets/standard/widget_content_view');
cdb.geo.ui.Widget.Error = require('./geo/ui/widgets/standard/widget_error_view');
cdb.geo.ui.Widget.Loader = require('./geo/ui/widgets/standard/widget_loader_view');
cdb.geo.ui.Widget.Category.Content = require('./geo/ui/widgets/category/content_view');
cdb.geo.ui.Widget.Category.FilterView = require('./geo/ui/widgets/category/filter_view');
cdb.geo.ui.Widget.Category.ItemView = require('./geo/ui/widgets/category/item_view');
cdb.geo.ui.Widget.Category.ItemsView = require('./geo/ui/widgets/category/items_view');
cdb.geo.ui.Widget.CategoryModel = require('./geo/ui/widgets/category/model');
cdb.geo.ui.Widget.Category.PaginatorView = require('./geo/ui/widgets/category/paginator_view');
cdb.geo.ui.Widget.Category.View = require('./geo/ui/widgets/category/view');
cdb.geo.ui.Widget.Formula.Content = require('./geo/ui/widgets/formula/content_view');
cdb.geo.ui.Widget.FormulaModel = require('./geo/ui/widgets/formula/model');
cdb.geo.ui.Widget.Formula.View = require('./geo/ui/widgets/formula/view');
cdb.geo.ui.Widget.Histogram.Chart = require('./geo/ui/widgets/histogram/chart');
cdb.geo.ui.Widget.Histogram.Content = require('./geo/ui/widgets/histogram/content_view');
cdb.geo.ui.Widget.HistogramModel = require('./geo/ui/widgets/histogram/model');
cdb.geo.ui.Widget.Histogram.View = require('./geo/ui/widgets/histogram/view');
cdb.geo.ui.Widget.ListModel = require('./geo/ui/widgets/list/model');
cdb.geo.ui.Widget.List.View = require('./geo/ui/widgets/list/view');
cdb.geo.ui.Widget.List.EdgesView = require('./geo/ui/widgets/list/edges_view');
cdb.geo.ui.Widget.List.PaginatorView = require('./geo/ui/widgets/list/paginator_view');
cdb.geo.ui.Widget.List.ItemView = require('./geo/ui/widgets/list/item_view');
cdb.geo.ui.Widget.List.ItemsView = require('./geo/ui/widgets/list/items_view');
cdb.geo.ui.Widget.List.Content = require('./geo/ui/widgets/list/content_view');

cdb.windshaft.filters.FilterBase = require('./windshaft/filters/base');
cdb.windshaft.filters.BoundingBoxFilter = require('./windshaft/filters/bounding_box');
cdb.windshaft.filters.CategoryFilter = require('./windshaft/filters/category');
cdb.windshaft.filters.Collection = require('./windshaft/filters/collection');
cdb.windshaft.filters.RangeFilter = require('./windshaft/filters/range');
cdb.windshaft.Client = require('./windshaft/client');
cdb.windshaft.config = require('./windshaft/config');
cdb.windshaft.Dashboard = require('./windshaft/dashboard');
cdb.windshaft.DashboardInstance = require('./windshaft/dashboard_instance');
cdb.windshaft.PrivateDashboardConfig = require('./windshaft/private_dashboard_config');
cdb.windshaft.PublicDashboardConfig = require('./windshaft/public_dashboard_config');

module.exports = cdb;
