cdb.geo.ui.Image = cdb.geo.ui.Text.extend({

  className: "cartodb-overlay image-overlay",

  events: {
    "click": "stopPropagation"
  },

  default_options: { },

  stopPropagation: function(e) {

    e.stopPropagation();

  },

  initialize: function() {

    _.defaults(this.options, this.default_options);

    this.template = this.options.template;

    var self = this;

    $(window).on("map_resized", function() {
      self._place();
    });

    $(window).on("resize", function() {
      self._place();
    });

  },

  _applyStyle: function() {

    var style      = this.model.get("style");

    var boxColor   = style["box-color"];
    var boxOpacity = style["box-opacity"];
    var boxWidth   = style["box-width"];

    this.$text.css(style);
    this.$el.css("z-index", style["z-index"]);

    var rgbaCol = 'rgba(' + parseInt(boxColor.slice(-6,-4),16)
    + ',' + parseInt(boxColor.slice(-4,-2),16)
    + ',' + parseInt(boxColor.slice(-2),16)
    +', ' + boxOpacity + ' )';

    this.$el.css({
      backgroundColor: rgbaCol
    });

    var url = this.model.get("extra").url;

    this._loadImage(url)

    this.$el.find("img").css({ width: boxWidth });

  },

  _loadImage: function(url) {

    var self = this;

    var success = function() {
      self._onLoadSuccess(url);
    };

    var error = function() {
      self._onLoadError(url);
    };

    $("<img/>")
    .load(success)
    .error(error)
    .attr("src", url);

  },

  _onLoadError: function(url) {
    this.$el.addClass('error');
  },

  _onLoadSuccess: function(url) {

    var style     = this.model.get("style");
    var boxWidth  = style["box-width"];
    var extra     = this.model.get("extra");
    var img       = "<img src='" + url + "' style='width: " + boxWidth + "px'/>";

    extra.rendered_text = img;

    this.model.set({ extra: extra }, { silent: true });

    this.$text.html(img);

    this.show();

  },

  render: function() {

    var content = this.model.get("extra").rendered_text;

    if (this.model.get("extra").has_default_image) {
      var url = this.model.get("extra").public_default_image_url;
      content = '<img src="' + url + '" />';
    }

    this.$el.html(this.template(_.extend(this.model.attributes, { content: content })));

    this.$text = this.$el.find(".text");

    var self = this;

    setTimeout(function() {
      self._applyStyle();
      self._place();
    }, 500);

    return this;

  }

});
