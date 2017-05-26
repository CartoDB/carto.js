var _ = require('underscore');
var templates = require('cdb.templates');
var View = require('../../core/view');

var Notification = View.extend({

  tagName: 'div',
  className: 'dialog',

  events: {
    'click .close': 'hide'
  },

  default_options: {
      timeout: 0,
      msg: '',
      hideMethod: '',
      duration: 'normal'
  },

  initialize: function() {
    this.closeTimeout = -1;
    _.defaults(this.options, this.default_options);
    this.template = this.options.template ? _.template(this.options.template) : templates.getTemplate('common/notification');

    this.$el.hide();
  },

  render: function() {
    var $el = this.$el;
    $el.html(this.template(this.options));
    if(this.render_content) {
      this.$('.content').append(this.render_content());
    }
    return this;
  },

  hide: function(ev) {
    var self = this;
    if (ev)
      ev.preventDefault();
    clearTimeout(this.closeTimeout);
    if(this.options.hideMethod != '' && this.$el.is(":visible") ) {
      this.$el[this.options.hideMethod](this.options.duration, 'swing', function() {
        self.$el.html('');
        self.trigger('notificationDeleted');
        self.remove();
      });
    } else {
      this.$el.hide();
      self.$el.html('');
      self.trigger('notificationDeleted');
      self.remove();
    }

  },

  open: function(method, options) {
    this.render();
    this.$el.show(method, options);
    if(this.options.timeout) {
        this.closeTimeout = setTimeout(_.bind(this.hide, this), this.options.timeout);
    }
  }

});

module.exports = Notification;
