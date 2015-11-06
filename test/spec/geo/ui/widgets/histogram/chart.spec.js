var _ = require('underscore');
var $ = require('jquery');
var d3 = require('d3');
var WidgetHistogramChart = require('cdb/geo/ui/widgets/histogram/chart');

describe('geo/ui/widgets/histogram/chart', function() {
  afterEach(function() {
    $('.js-chart').remove();
  });

  beforeEach(function() {
    d3.select("body").append("svg").attr('class', 'js-chart');

    this.width = 300;
    this.height = 100;

    d3.select($('.js-chart')[0])
    .attr('width',  this.width)
    .attr('height', this.height)
    .append('g')
    .attr('class', 'Canvas');

    this.data = genHistogramData(20);
    this.margin = { top: 4, right: 4, bottom: 20, left: 4 };

    this.view = new WidgetHistogramChart(({
      el: $('.js-chart'),
      y: 0,
      margin: this.margin,
      handles: true,
      width: this.width,
      height: 100,
      data: this.data
    }));
    window.chart = this.view;
  });

  it('should calculate the width of the bars', function() {
    this.view.render().show();
    expect(this.view.barWidth).toBe((this.width - this.margin.left - this.margin.right) / this.data.length);
  });

  it('should draw the bars', function() {
    this.view.render().show();
    expect(this.view.$el.find('.Bar').size()).toBe(this.data.length);
  });

  it('should draw the axis', function() {
    this.view.render().show();
    expect(this.view.$el.find('.Axis').size()).toBe(1);
  });

  it('should draw the handles', function() {
    this.view.render().show();
    expect(this.view.$el.find('.Handle').size()).toBe(2);
  });

  xit('should refresh the data', function() {
    spyOn(this.view, 'refresh').and.callThrough();
    this.view.render().show();
    this.view.reset(genHistogramData(20));
    expect(this.view.refresh).toHaveBeenCalled();
  });

  xit('shouldn\'t refresh the data', function() {
    this.view.model.set('locked', true);
    spyOn(this.view, 'refresh').and.callThrough();
    this.view.render().show();
    this.view.reset(genHistogramData(20));
    expect(this.view.refresh).not.toHaveBeenCalled();
  });


});

function genHistogramData(n) {
  n = n || 1;
  var arr = [];
  _.times(n, function(i) {
    var start = (100 * i) + Math.round(Math.random() * 1000);
    var end = start + 100;
    var obj = {
      bin: i,
      freq: Math.round(Math.random() * 10),
      start: start,
      end: end,
      max: end,
      min: start
    };
    arr.push(obj);
  });
  return arr;
}
