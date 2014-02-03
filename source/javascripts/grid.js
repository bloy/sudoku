var grid = grid || {};

grid.Cell = Backbone.Model.extend({
  defaults: function() {
    return {
      value: '',
      enteredValue: '',
      row: '',
      column: '',
      group: '',
      selected: false,
      valid: true,
      possible: [1,2,3,4,5,6,7,8,9],
    }
  },

  initialize: function() {
    this.on('change:enteredValue', this.updateValue);
    this.on('change:possible', this.updateValue);
    this.on('change:value', this.updateSiblings);
    this.on('change:value', this.updateValidity);
  },

  initSiblings: function() {
    var self = this;
    this.siblings = this.collection.filter(function(cell) {
      return (self.cid != cell.cid &&
              (self.attributes.row == cell.attributes.row ||
               self.attributes.column == cell.attributes.column ||
               self.attributes.group == cell.attributes.group));
    });
  },

  updateValue: function() {
    if (this.get('enteredValue') != '') {
      this.set('value', this.get('enteredValue'));
    } else {
      this.set('value', '');
    }
  },

  updateValidity: function() {
    var thisValue = this.attributes.value;
    if (thisValue == '') {
      this.set('valid', true);
    } else {
      this.set('valid',
               !this.siblings.some(function(c) {
                 return c.attributes.value == thisValue;
               }));
    }
  },

  updateSiblings: function() {
    console.log('update siblings');
    _.invoke(this.siblings, 'updateValidity');
  },
});


grid.CellCollection = Backbone.Collection.extend({
  model: grid.Cell
});


grid.CellView = Backbone.View.extend({
  tagName: 'td',
  template: _.template($('#cell-template').html()),
  className: function() {
    return "row_" + this.model.get('row') +
      " column_" + this.model.get('column') +
      " group_" + this.model.get('group');
  },
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
    cells.invoke('initSiblings');
  },
});

$(function() {
  App = new grid.AppView();
  $('body').keydown(function(event) {
    // 49 is key code for 1, 57 is key code for 9, 32 for space
    if (event.keyCode == 32 || (event.keyCode <= 57 && event.keyCode >= 49)) {
      var key = event.keyCode - 48; // 48 is keycode for 0
      if (event.keyCode == 32) {
        key = '';
      }
      var selected = App.cells.findWhere({selected: true});
      if (selected) {
        selected.set({enteredValue: key});
      }
    }
  });
});
