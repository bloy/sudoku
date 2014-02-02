var grid = grid || {};

grid.Cell = Backbone.Model.extend({
  defaults: function() {
    return {
      value: '',
      row: '',
      column: '',
      group: '',
      selected: false,
      possible: [1,2,3,4,5,6,7,8,9],
    }
  },
});


grid.CellCollection = Backbone.Collection.extend({
  model: grid.Cell
});


grid.CellView = Backbone.View.extend({
  tagName: 'td',
  template: _.template($('#cell-template').html()),
  events: {
    'click ': 'select',
  },

  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    if (this.model.get('selected')) {
      this.$el.addClass('selected');
    } else {
      this.$el.removeClass('selected');
    }
    return this;
  },

  select: function() {
    App.cells.forEach(function(cell) {
      cell.set('selected', false)
    });
    this.model.set('selected', true);
  },
});


grid.AppView = Backbone.View.extend({
  el: '#gridapp',

  initialize: function() {
    var rowTemplate = _.template('<tr id="grid_row_<%= row %>"></tr>');
    this.cells = new grid.CellCollection();
    var cells = this.cells;
    _.times(9, function(row) {
      $('#grid').append(rowTemplate({row: row}));
      _.times(9, function(column) {
        var cell = new grid.Cell({
          row: row,
          column: column,
          group: (Math.floor(column / 3)) + (Math.floor(row / 3) * 3),
        });
        cells.add(cell);
        var view = new grid.CellView({model: cell});
        $('#grid_row_' + row).append(view.render().el);
      });
    });
  },
});

$(function() {
  App = new grid.AppView();
  $('body').keydown(function(event) {
    // 49 is key code for 1, 57 is key code for 9
    if (event.keyCode > 57 || event.keyCode < 49) {
      return;
    }
    var key = event.keyCode - 48; // 48 is keycode for 0
    console.log(key);
  });
});
