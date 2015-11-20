var _ = require('underscore');
var $ = require('jquery');
var Backbone = require('backbone');

/**
 * Usage:
 * var infowindowModel = new InfowindowModel({
 *   template_name: 'infowindow_light',
 *   latlng: [72, -45],
 *   offset: [100, 10]
 * });
 */
var InfowindowModel = Backbone.Model.extend({

  SYSTEM_COLUMNS: ['the_geom', 'the_geom_webmercator', 'created_at', 'updated_at', 'cartodb_id', 'cartodb_georef_status'],

  defaults: {
    template_name: 'infowindow_light',
    latlng: [0, 0],
    offset: [28, 0], // offset of the tip calculated from the bottom left corner
    maxHeight: 180, // max height of the content, not the whole infowindow
    autoPan: true,
    template: "",
    content: "",
    visibility: false,
    alternative_names: { },
    fields: null // contains the fields displayed in the infowindow
  },

  clearFields: function() {
    this.set({fields: []});
  },

  saveFields: function(where) {
    where = where || 'old_fields';
    this.set(where, _.clone(this.get('fields')));
  },

  fieldCount: function() {
    var fields = this.get('fields')
    if (!fields) return 0;
    return fields.length
  },

  restoreFields: function(whiteList, from) {
    from = from || 'old_fields';
    var fields = this.get(from);
    if(whiteList) {
      fields = fields.filter(function(f) {
        return _.contains(whiteList, f.name);
      });
    }
    if(fields && fields.length) {
      this._setFields(fields);
    }
    this.unset(from);
  },

  _cloneFields: function() {
    return _(this.get('fields')).map(function(v) {
      return _.clone(v);
    });
  },

  _setFields: function(f) {
    f.sort(function(a, b) { return a.position -  b.position; });
    this.set({'fields': f});
  },

  sortFields: function() {
    this.get('fields').sort(function(a, b) { return a.position - b.position; });
  },

  _addField: function(fieldName, at) {
    var dfd = $.Deferred();
    if(!this.containsField(fieldName)) {
      var fields = this.get('fields');
      if(fields) {
        at = at === undefined ? fields.length: at;
        fields.push({ name: fieldName, title: true, position: at });
      } else {
        at = at === undefined ? 0 : at;
        this.set('fields', [{ name: fieldName, title: true, position: at }], { silent: true});
      }
    }
    dfd.resolve();
    return dfd.promise();
  },

  addField: function(fieldName, at) {
    var self = this;
    $.when(this._addField(fieldName, at)).then(function() {
      self.sortFields();
      self.trigger('change:fields');
      self.trigger('add:fields');
    });
    return this;
  },

  getFieldProperty: function(fieldName, k) {
    if(this.containsField(fieldName)) {
      var fields = this.get('fields') || [];
      var idx = _.indexOf(_(fields).pluck('name'), fieldName);
      return fields[idx][k];
    }
    return null;
  },

  setFieldProperty: function(fieldName, k, v) {
    if(this.containsField(fieldName)) {
      var fields = this._cloneFields() || [];
      var idx = _.indexOf(_(fields).pluck('name'), fieldName);
      fields[idx][k] = v;
      this._setFields(fields);
    }
    return this;
  },

  getAlternativeName: function(fieldName) {
    return this.get("alternative_names") && this.get("alternative_names")[fieldName];
  },

  setAlternativeName: function(fieldName, alternativeName) {
    var alternativeNames = this.get("alternative_names") || [];

    alternativeNames[fieldName] = alternativeName;
    this.set({ 'alternative_names': alternativeNames });
    this.trigger('change:alternative_names');
  },

  getFieldPos: function(fieldName) {
    var p = this.getFieldProperty(fieldName, 'position');
    if(p == undefined) {
      return Number.MAX_VALUE;
    }
    return p;
  },

  containsAlternativeName: function(fieldName) {
    var names = this.get('alternative_names') || [];
    return names[fieldName];
  },

  containsField: function(fieldName) {
    var fields = this.get('fields') || [];
    return _.contains(_(fields).pluck('name'), fieldName);
  },

  removeField: function(fieldName) {
    if(this.containsField(fieldName)) {
      var fields = this._cloneFields() || [];
      var idx = _.indexOf(_(fields).pluck('name'), fieldName);
      if(idx >= 0) {
        fields.splice(idx, 1);
      }
      this._setFields(fields);
      this.trigger('remove:fields')
    }
    return this;
  },

  // updates content with attributes
  updateContent: function(attributes) {
    var fields = this.get('fields');
    this.set('content', InfowindowModel.contentForFields(attributes, fields));
  },

  closeInfowindow: function(){
  if (this.get('visibility')) {
      this.set("visibility", false);
      this.trigger('close');
    }
  }

}, {
  contentForFields: function(attributes, fields, options) {
    options = options || {};
    var render_fields = [];
    for(var j = 0; j < fields.length; ++j) {
      var field = fields[j];
      var value = attributes[field.name];
      if(options.empty_fields || (value !== undefined && value !== null)) {
        render_fields.push({
          title: field.title ? field.name : null,
          value: attributes[field.name],
          index: j
        });
      }
    }

    // manage when there is no data to render
    if (render_fields.length === 0) {
      render_fields.push({
        title: null,
        value: 'No data available',
        index: 0,
        type: 'empty'
      });
    }

    return {
      fields: render_fields,
      data: attributes
    };
  }
});

module.exports = InfowindowModel;
