cdb.geo.ui.Text = cdb.core.View.extend({

  className: "cartodb-overlay overlay-text",

  template: cdb.core.Template.compile(
    '<div class="content">\
    <div class="text widget_text">{{{ text }}}</div>\
    </div>',
    'mustache'
  ),

  events: {
    "click": "stopPropagation"
  },

  defaults: {
    x: 0,
    y: 0,
    style: {
      textAlign: "left",
      zIndex: 5,
      color: "#ffffff",
      fontSize: "13",
      fontFamilyName: "Helvetica",
      boxColor: "#333333",
      boxOpacity: 0.7,
      boxPadding: 10,
      lineWidth: 50,
      lineColor: "#333333"
    }
  },


  stopPropagation: function(e) {

    e.stopPropagation();

  },

  initialize: function() {

    this.template = this.options.template || this.template;

    this._cleanStyleProperties(this.options.style);

    _.defaults(this.options.style, this.defaults.style);

    var self = this;

    $(window).on("map_resized", function() {
      self._place();
    });

    $(window).on("resize", function() {
      self._place();
    });

    this._setupModels();

  },

  _getStandardPropertyName: function(name) {

    if (!name) return;
    var parts = name.split("-");

    if (parts.length === 1) return name;
    else if (parts.length === 2) {
      return parts[0] + parts[1].slice(0, 1).toUpperCase() + parts[1].slice(1);
    }

  },

  _cleanStyleProperties: function(hash) {

    var standardProperties = {};

    _.each(hash, function(value, key) {
      standardProperties[this._getStandardPropertyName(key)] = value;
    }, this);

    this.options.style = standardProperties;

  },

  _setupModels: function() {

    this.model = new cdb.core.Model({ 
      display: true,
      hidden: false,
      text: this.options.text,
      x:    this.options.x,
      y:    this.options.y
    });

    this.model.on("change:text",    this._onChangeText, this);
    this.model.on("change:display", this._onChangeDisplay, this);

    this.extra = new cdb.core.Model(this.options.extra);
    this.add_related_model(this.extra);

    this.style = new cdb.core.Model(this.options.style);
    this.style.on("change", this._applyStyle, this);
    this.add_related_model(this.style);

  },

  _onChangeText: function() {
    this.$el.find(".text").html(this._sanitizedText());
  },

  _onChangeDisplay: function() {
    if (this.model.get("display")) this.show();
    else this.hide();
  },

  setText: function(text) {
    this.model.set("text", text);
  },

  setStyle: function(property, value) {

    var standardProperty = this._getStandardPropertyName(property);

    if (standardProperty) {
      this.style.set(standardProperty, value);
    }

  },


  _applyStyle: function() {

    var textColor  = this.style.get("color");
    var boxColor   = this.style.get("boxColor");
    var boxOpacity = this.style.get("boxOpacity");
    var boxWidth   = this.style.get("boxWidth");
    var fontFamily = this.style.get("fontFamilyName");

    this.$text = this.$el.find(".text");

    this.$text.css({ color: textColor });
    this.$text.css("font-size", this.style.get("fontSize") + "px");
    this.$el.css("z-index", this.style.get("zIndex"));

    var fontFamilyClass = "";

    if      (fontFamily  == "Droid Sans")       fontFamilyClass = "droid";
    else if (fontFamily  == "Vollkorn")         fontFamilyClass = "vollkorn";
    else if (fontFamily  == "Open Sans")        fontFamilyClass = "open_sans";
    else if (fontFamily  == "Roboto")           fontFamilyClass = "roboto";
    else if (fontFamily  == "Lato")             fontFamilyClass = "lato";
    else if (fontFamily  == "Graduate")         fontFamilyClass = "graduate";
    else if (fontFamily  == "Gravitas One")     fontFamilyClass = "gravitas_one";
    else if (fontFamily  == "Old Standard TT")  fontFamilyClass = "old_standard_tt";

    var rgbaCol = 'rgba(' + parseInt(boxColor.slice(-6,-4),16)
    + ',' + parseInt(boxColor.slice(-4,-2),16)
    + ',' + parseInt(boxColor.slice(-2),16)
    +', ' + boxOpacity + ' )';

    this.$el
    .removeClass("droid")
    .removeClass("vollkorn")
    .removeClass("roboto")
    .removeClass("open_sans")
    .removeClass("lato")
    .removeClass("graduate")
    .removeClass("gravitas_one")
    .removeClass("old_standard_tt");

    this.$el.addClass(fontFamilyClass);
    this.$el.css({
      backgroundColor: rgbaCol,
      maxWidth:        boxWidth
    });

  },

  _place: function(position) {

    var extra = position || this.extra.attributes;

    var top   = this.model.get("y");
    var left  = this.model.get("x");

    var bottom_position = extra.bottom - this.$el.height();
    var right_position  = extra.right  - this.$el.width();

    // position percentages
    var top_percentage  = extra.top_percentage;
    var left_percentage = extra.left_percentage;

    var right  = "auto";
    var bottom = "auto";

    var marginTop  = 0;
    var marginLeft = 0;

    var width  = extra.width;
    var height = extra.height;

    var portrait_dominant_side  = extra.portrait_dominant_side;
    var landscape_dominant_side = extra.landscape_dominant_side;

    if (portrait_dominant_side === 'bottom' && bottom_position <= 250) {

      top = "auto";
      bottom = bottom_position;

    } else if (top_percentage > 45 && top_percentage < 55) {

      top = "50%";
      marginTop = -height/2;

    }

    if (landscape_dominant_side === 'right' && right_position <= 250) {

      left = "auto";
      right = right_position;

    } else if (left_percentage > 45 && left_percentage < 55) {

      left = "50%";
      marginLeft = -width/2;

    }

    this.$el.css({
      marginLeft: marginLeft,
      marginTop: marginTop,
      top: top,
      left: left,
      right: right,
      bottom: bottom
    });

  },

  show: function(callback) {
    this.$el.fadeIn(150, function() {
      callback && callback();
    });
  },

  hide: function(callback) {
    this.$el.fadeOut(150, function() {
      callback && callback();
    });
  },

  _fixLinks: function() {

    this.$el.find("a").each(function(i, link) {
      $(this).attr("target", "_top");
    });

  },

  _sanitizedText: function() {
    return cdb.core.sanitize.html(this.model.get("text"), this.model.get('sanitizeText'));
  },

  render: function() {
    var d = _.clone(this.model.attributes);
    d.text = this._sanitizedText();
    this.$el.html(this.template(d));

    this._fixLinks();

    var self = this;
    setTimeout(function() {
      self._applyStyle();
      self._place();
      self.show();
    }, 900);

    return this;

  }

});
