var grid = grid || {};

grid.Cell = Backbone.Model.extend({
  defaults: function() {
    return {
      value: '',
      row: '',
      column: '',
      group: '',
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
    'click ': 'toggleSelected',
  },

  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    this.input = this.$('.edit');
    return this;
  },

  toggleSelected: function() {
    console.info('clicked on: ' + this.model.get('row') + ',' + this.model.get('column'));
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
});
