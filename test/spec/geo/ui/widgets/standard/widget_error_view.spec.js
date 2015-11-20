var WidgetModel = require('cdb/geo/ui/widgets/widget_model');
var WidgetErrorView = require('cdb/geo/ui/widgets/standard/widget_error_view');

describe('geo/ui/widgets/standard/widget_error_view', function() {

  beforeEach(function() {
    jasmine.clock().install();

    this.model = new WidgetModel({
      id: 'widget_98334',
      title: 'Helloooo',
      columns: ['cartodb_id', 'title']
    });

    spyOn(this.model, 'bind').and.callThrough();

    this.view = new WidgetErrorView({
      model: this.model
    });
  });

  it('should have render correctly', function() {
    this.view.render();
    expect(this.view.$el.hasClass('Widget-error')).toBeTruthy();
  });

  it('should have a binds from the beginning', function() {
    expect(this.model.bind.calls.argsFor(0)[0]).toEqual('error');
    expect(this.model.bind.calls.argsFor(1)[0]).toEqual('loading sync');
  });

  it('should fetch again the data when refresh button is clicked', function() {
    spyOn(this.model, 'fetch');
    this.view.render();
    this.view.show();
    jasmine.clock().tick(400);
    this.view.$('.js-refresh').click();
    expect(this.model.fetch).toHaveBeenCalled();
  });

  describe('visibility', function() {
    beforeEach(function() {
      this.view.render();
    });

    it('should remove is-visible class when element isn\'t showed', function() {
      this.view.hide();
      expect(this.view.$el.hasClass('is-visible')).toBeFalsy();
      jasmine.clock().tick(550);
      expect(this.view.$el.css('display')).toBe('none');
    });

    it('should add is-visible class when element is showed', function() {
      this.view.show();
      expect(this.view.$el.hasClass('is-visible')).toBeTruthy();
    });
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

});
