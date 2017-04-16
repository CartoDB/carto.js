describe("cdb.geo.ui.Text", function() {

  var data, view, map, mapView;

  describe("Text rendering", function() {

    beforeEach(function() {

      map = new cdb.geo.Map();

      container = $('<div>').css('height', '200px');

      mapView = new cdb.geo.GoogleMapsMapView({
        el: container,
        map: map
      });

      view = new cdb.geo.ui.Text({
        text: "This is <a href='http://www.cartodb.com'>a link</a> and this <a href='http://www.cartodb.com'>too</a>",
        y: 0,
        x: 40,
        style: {
          textAlign: "left",
          zIndex: 1000,
          textAlign: "right",
          "font-size": "13",
          fontFamilyName: "Helvetica",
          "box-color": "#F84F40",
          boxOpacity: 0.7,
          boxPadding: 10,
          "line-width": 50
        }
      });

      mapView.$el.append(view.render().$el);

    });

    afterEach(function() {
      view.clean();
      container.remove();
    });

    it("should render the right links", function(done) {
      setTimeout(function() {
        expect(view.$el.find(".text a:first-child").attr("target")).toEqual("_top");
        expect(view.$el.find(".text a:last-child").attr("target")).toEqual("_top");
        done();
      }, 700);
    });

  });

  describe("Text setters", function() {

    beforeEach(function() {

      map = new cdb.geo.Map();

      container = $('<div>').css('height', '200px');

      mapView = new cdb.geo.GoogleMapsMapView({
        el: container,
        map: map
      });

      view = new cdb.geo.ui.Text({
        text: "You are <strong>here</strong>",
        x: 10,
        y: 20,
        style: {
          textAlign: "left",
          zIndex: 1000,
          "font-size": "13",
          fontFamilyName: "Helvetica",
          "box-color": "#F84F40",
          boxOpacity: 0.7,
          boxPadding: 10,
          "line-width": 50
        }
      });

      mapView.$el.append(view.render().$el);

    });

    afterEach(function() {
      view.clean();
      container.remove();
    });

    it("should render", function(done) {
      setTimeout(function() {
        expect(view.$el.find(".text").html()).toEqual("You are <strong>here</strong>");
        expect(view.$el.css("background-color").indexOf('rgba(248, 79, 64')).toEqual(0);
        expect(view.$el.find(".text").css("color")).toEqual('rgb(255, 255, 255)');
        done();
      }, 900);
    });

    it("should allow to change the text", function() {
      expect(view.model.set("text", "Now you are here"));
      expect(view.$el.find(".text").html()).toEqual("Now you are here");
    });

    it("should allow to change the text", function() {
      expect(view.setText("I'm here"));
      expect(view.$el.find(".text").text()).toEqual("I'm here");
    });

    it("should allow to change the style", function() {
      expect(view.setStyle("color", "#000000"));
      expect(view.$el.find(".text").css("color")).toEqual('rgb(0, 0, 0)');
    });


  });


});
