(async () => {

  /* Carto setup */

  // Create the Client
  var client = new carto.Client({
    apiKey: '84fdbd587e4a942510270a48e843b4c1baa11e18',
    username: 'cartojs-test'
  });

  // Create the Sources
  var spanishCitiesSource = new carto.source.SQL('SELECT * FROM ne_10m_populated_places_simple WHERE adm0name = \'Spain\'');
  var populatedPlacesSource = new carto.source.Dataset('ne_10m_populated_places_simple');

  // Create the Styles
  var spanishCitiesStyle = new carto.style.CartoCSS(`
    #layer {
      marker-width: 10;
      marker-fill: red;
    }`
  );
  var populatedPlacesStyle = new carto.style.CartoCSS(`
    #layer {
      marker-width: 15;
      marker-fill: #CDCDCD;
    }`
  );

  // Create the Layers
  var spanishCities = new carto.layer.Layer(spanishCitiesSource, spanishCitiesStyle);
  var populatedPlaces = new carto.layer.Layer(populatedPlacesSource, populatedPlacesStyle);

  // Add the Layers to the Client
  client.addLayers([ spanishCities, populatedPlaces ]);

  /* Leaflet setup */

  // Create a Map
  var map = L.map('map').setView([42.431234, -8.643616], 5);

  // Add a Basemap
  L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager_nolabels/{z}/{x}/{y}.png')
  .addTo(map);

  // Add the Carto Leaflet layer. It contains all the layers added to the client
  client.getLeafletLayer()
  .addTo(map);

})();
