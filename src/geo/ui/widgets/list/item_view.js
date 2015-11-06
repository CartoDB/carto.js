var _ = require('underscore');
var format = require('cdb/core/format');
var View = require('cdb/core/view');

module.exports = View.extend({

  tagName: 'li',
  className: 'Widget-listItem',

  events: {
    'click .js-button': '_onItemClick'
  },

  _TEMPLATE: ' ' +
    '<% if (isClickable) { %>'+
      '<button type="button" class="Widget-listItemInner Widget-listButton Widget-listButton--withBorder js-button">'+
    '<% } else { %>'+
      '<div class="Widget-listItemInner Widget-listItemInner--withBorders">'+
    '<% } %>'+
      '<div class="Widget-contentSpaced Widget-contentSpaced--topAligned Widget-contentSpaced--start">'+
        '<em class="Widget-dot Widget-listDot"></em>'+
        '<% if (itemsCount > 0) { %>'+
          '<div class="Widget-contentFull">'+
            '<p class="Widget-textSmall Widget-textSmall--upper Widget-textSmall--bold" title="<%- items[0][1] %>"><%- items[0][1] %></p>'+
            '<% if (itemsCount > 2) { %>'+
              '<dl class="Widget-inlineList">'+
              '<% for (var i = 1, l = itemsCount; i < l; i++) { %>'+
                '<div class="Widget-inlineListItem Widget-textSmaller Widget-textSmaller--noEllip">'+
                  '<dd class="Widget-textSmaller--bold Widget-textSmaller--dark u-rSpace" title="<%- items[i][1] %>"><%- items[i][1] %></dd>'+
                  '<dt title="<%- items[i][0] %>"><%- items[i][0] %></dt>'+
                '</div>'+
              '<% } %>'+
              '</dl>'+
            '<% } else if (itemsCount === 2) { %>'+
              '<dl class="Widget-textSmaller Widget-textSmaller--noEllip u-tSpace">'+
                '<dd class="Widget-textSmaller--bold Widget-textSmaller--dark u-rSpace" title="<%- items[1][1] %>"><%- items[1][1] %></dd>'+
                '<dt title="<%- items[1][0] %>"><%- items[1][0] %></dt>'+
              '</dl>'+
            '<% } %>'+
          '</div>'+
        '<% } %>'+
      '</div>'+
    '<% if (isClickable) { %>'+
      '</button>'+
    '<% } else { %>'+
      '</div>'+
    '<% } %>',

  initialize: function() {
    this.viewModel = this.options.viewModel;
  },

  render: function() {
    var template = _.template(this._TEMPLATE);
    var data = this.model.toJSON();
    var hasInteractivity = this._hasInteractivity(data);
    var items = this._sanitizeData(data);

    this.$el.html(
      template({
        items: items,
        isClickable: hasInteractivity,
        itemsCount: _.size(items)
      })
    );

    // If there is no cartodb_id defined, click event should
    // be disabled
    this[ hasInteractivity ? 'delegateEvents' : 'undelegateEvents' ]();
    return this;
  },

  // Remove cartodb_id, if exists
  // Replace titles if there are alternatives
  // Convert data object to array items
  _sanitizeData: function(data) {
    var hasInteractivity = this._hasInteractivity(data);
    var data = _.omit(data, function(value, key, object) {
      return key === 'cartodb_id';
    });

    var columnTitles = this.viewModel.get('columns_title');
    if (hasInteractivity && !_.isEmpty(columnTitles)) {
      columnTitles = _.rest(columnTitles, 1);
    }

    // Convert to pair items and check if there is a column title
    var arr = [];
    var i = 0;

    _.each(data, function(value, key) {
      var title = columnTitles && columnTitles[i] || key;
      arr.push([ title, format.formatValue(value) ]);
      ++i;
    });

    return arr;
  },

  _hasInteractivity: function(data) {
    return !_.isEmpty(
      _.filter(data, function(value, key){
        return key === 'cartodb_id'
      })
    )
  },

  _onItemClick: function() {
    this.trigger('itemClicked', this.model, this);
  }

});
