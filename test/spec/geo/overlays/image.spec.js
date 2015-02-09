describe("cdb.geo.ui.Image", function() {

  var data, view;

  var public_default_image_url = "http://cartodb.s3.amazonaws.com/static/overlay_placeholder_cartofante.png";
  var default_image_url        = "http://cartodb.s3.amazonaws.com/static/overlay_placeholder.png";

  describe("Image", function() {

    beforeEach(function() {

      var defaultOptions = {
        has_default_image: true,
        url: default_image_url,
        rendered_text: "<img src='" + default_image_url + "' />",
        default_image_url: default_image_url,
        public_default_image_url: public_default_image_url
      };

      var defaultStyle = {
        textAlign: "left",
        zIndex: 1000,
        textAlign: "right",
        "font-size": "13",
        fontFamilyName: "Helvetica",
        "box-color": "#F84F40",
        boxOpacity: 0.7,
        boxPadding: 10,
        "line-width": 50
      };

      var model = new cdb.core.Model({
        type: "image",
        display: true,
        width: 200,
        height: 200,
        device: "desktop",
        x: 0,
        y: 0,
        extra: defaultOptions,
        style: defaultStyle
    });

    var template = cdb.core.Template.compile('\
      <div class="content">\
      <div class="text widget_text">{{{ content }}}</div>\
      </div>','mustache');

    view = new cdb.geo.ui.Image({ template: template, model: model });

    });

    afterEach(function() {
      view.clean();
    });

    it("should render the image", function(done) {

      view.render();

      setTimeout(function() {
        expect(view.$el.find("img")).toBeDefined();
        expect(view.$el.find("img").attr("src")).toBe(default_image_url);
        done();
      }, 1000);

    });
  });
});
