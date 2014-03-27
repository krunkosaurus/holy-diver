// by underscore.js!
var _each = function(obj, iterator, context) {
  if (obj == null) return obj;
  if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
    obj.forEach(iterator, context);
  } else if (obj.length === +obj.length) {
    for (var i = 0, length = obj.length; i < length; i++) {
      if (iterator.call(context, obj[i], i, obj) === breaker) return;
    }
  } else {
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
    }
  }
  return obj;
};

function flatten(root, setup) {
  this.build(root, setup);
}

flatten.prototype.build = function(root, setup) {
  var self = this;
  self.cols = {
    label: setup.cols.label.split(" -> "),
    cells: setup.cols.cells.split(" -> ")
  };
  self.rows = {
    index: setup.rows.index.split(" -> "),
    cells: setup.rows.cells.split(" -> ")
  };
  
  self.table = [];
  self.series = [];
  self.raw = root;
    
  // Header (Series)
  (function(){
    var label = self.cols.label;
    var cells = parse.apply(self, [root[0]].concat(self.cols.cells));
    self.table.push(label.concat(cells));
    
    if (setup.cols.transform) {
      for (var col in setup.cols.transform) {
        if (self.table[0].length > col) {
          self.table[0][col] = setup.cols.transform[col](self.table[0][col]);
        }
      }
    }
    
    _each(cells, function(el, index){
      self.series.push({ key: el, values: [] });
    });
    // console.log(self.table[0]);
  })();
  
  // Rows
  _each(root, function(el, i){
    var index = parse.apply(self, [el].concat(self.rows.index));
    var cells = parse.apply(self, [el].concat(self.rows.cells));
    self.table.push(index.concat(cells));
    
    if (setup.rows.transform) {
      for (var row in setup.rows.transform) {
        if (self.table[i+1].length > row) {
          self.table[i+1][row] = setup.rows.transform[row](self.table[i+1][row]);
        }
      }
    }
    
    _each(self.series, function(series, j){
      //series['values'].push(cells[j]);
      _each(cells, function(cell, k){
        var output = {};
        output[self.cols.label] = self.table[i+1][0];
        output['value'] = cell;
        series['values'].push(output);
      });
    });
    
    // console.log(self.table[i+1]);
    
    
  });
  
  return this;
};

/*flatten.prototype.blend = function(that, config){
  var self = this;
  var options = config || {};
  var invader = (options.series) ? [that.series[options.series]] : that.series;
  
  // var isDate = toString.call(obj) == '[object ' + name + ']';
  _each(self.table, function(row, row_inc){
    var index = row[0];
    _each(invader, function(series, series_inc){
      if (row_inc == 0) {
        row.push(series.key);
        self.series.push(series);
      } else {
        row.push(options.match(row[0], series.values));
      }
    });
  });
  _each(invader, function(series, series_inc){
      
  });
  return self;
};
// EXAMPLE
window.mixed = window.keen.blend(keen2, {
	match: function(index, values) {
		console.log(index, values);
		var counter = 0;
		for (var i = 0; i < values.length; i++) {
			if (index.getUTCMonth() == values[i].date.getUTCMonth()) {
				counter++;
			}
		}
		return counter;
	}
});

*/

/*flatten.prototype.append = function(series, options){
  _each(this.table, function(row, i){
    if (i == 0) {
      row.push(series.key);
    } else {
      row.push(options.transform(row, series.values));
    }
  });
  return this;
};*/

flatten.prototype.render = function(format){
  if (format == 'csv') {
    console.log(this.table.join('\n'));
  }
  return this;
};


function parse() {
  var result = [];
  var loop = function() {
    var root = arguments[0];
    var args = Array.prototype.slice.call(arguments, 1);
    var target = args.pop();
    //console.log('DIVE ' + target + ':', root, args);
    
    if (args.length == 0) {
      if (root instanceof Array) {
        args = root;
      } else if (typeof root === 'object') {
        args.push(root);
      }
    }
    
    _each(args, function(el, index, list){
      
      if (el[target] || el[target] == 0 || el[target] !== void 0) {
        // Easy grab!
        if (el[target] == null) {
          return result.push('');
        } else {
          return result.push(el[target]);
        }
        
      } else if (root[el]){
        if (root[el] instanceof Array) {
          // dive through each array item
          _each(root[el], function(n, i) {
            var splinter = [root[el]].concat(root[el][i]).concat(args.slice(1)).concat(target);
            return loop.apply(this, splinter);
          });
          
        } else {
          if (root[el][target]) {
            // grab it!
            return result.push(root[el][target]);
            
          } else {
            // dive down a level!
            return loop.apply(this, [root[el]].concat(args.splice(1)).concat(target));
            
          }
        }
        
      } else {
        // dive down a level!
        return loop.apply(this, [el].concat(args.splice(1)).concat(target));
        
      }
      
      return; 

    });
    if (result.length > 0) {
      return result;
    }
  }
  return loop.apply(this, arguments);
}
