/*! 
  * ----------------
  * HOLY DIVER!
  * ----------------
  */

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
  self.sort = {
    rows: (setup.sort.rows) ? setup.sort.rows.split(":") : false,
    cols: (setup.sort.cols) ? setup.sort.cols.split(":") : false
  };
  
  self.table = [];
  self.series = [];
  self.raw = root;
  
  
  // SORT ROWS
  // ---------------------
  
  if (self.sort.rows.length > 0) {
    root.sort(function(a, b){
      var a_index = parse.apply(self, [a].concat(self.rows.index));
      var b_index = parse.apply(self, [b].concat(self.rows.index));
      
      if (self.sort.rows[1] == 'asc') {
        if (a_index > b_index) return 1;
        if (a_index < b_index) return -1;
        return 0;
      } else {
        if (a_index > b_index) return -1;
        if (a_index < b_index) return 1;
        return 0;
      }
      console.log("2014-01-19T07:00:00.000Z" > "2014-03-16T07:00:00.000Z");
      return false;
      if (a_index > b_index) return 1;
      if (b_index < a_index) return -1;
      return 0;
    })
  }
  
  
  // ADD SERIES
  // ---------------------
  
  (function(){
    var label = self.cols.label;
    var cells = parse.apply(self, [root[0]].concat(self.cols.cells));
    _each(cells, function(el, index){
      self.series.push({ key: el, values: [] });
    });
    
    // console.log(self.table[0]);
  })();
  
  
  // ADD SERIES' RECORDS
  // ---------------------
  
  _each(root, function(el, i){
    var index = parse.apply(self, [el].concat(self.rows.index));
    var cells = parse.apply(self, [el].concat(self.rows.cells));
    _each(cells, function(cell, j){
      var output = {};
      output[self.cols.label] = index;
      output['value'] = cell;
      self.series[j]['values'].push(output);
    })
  })
  
  
  // SORT COLUMNS
  // ---------------------
  
  if (self.sort.cols.length > 0) {

    self.series = self.series.sort(function(a, b){
      var a_total = 0;
      var b_total = 0;
      _each(a.values, function(record, index){
        a_total += record['value'];
      })
      _each(b.values, function(record, index){
        b_total += record['value'];
      })
      
      if (self.sort.cols[1] == 'asc') {
        return a_total - b_total;
      } else {
        return b_total - a_total;
      }
    })
  }
  
  
  // BUILD TABLE
  // ---------------------
  
  self.table = [];
  self.table.push(self.cols.label);
  
  _each(self.series[0].values, function(value, index){
    self.table.push(value[self.cols.label[0]]);
  })
  
  _each(self.series, function(series, index){
    self.table[0].push(series.key);
    _each(series.values, function(record, j){
      self.table[j+1].push(record['value']);
    })
  })
  
  
  // COLUMN TRANSFORMS
  // ---------------------
  
  if (setup.cols.transform) {
    for (var transform in setup.cols.transform) {
      if (typeof transform == 'number') {
        if (self.table[0].length > col) {
          self.table[0][transform] = setup.cols.transform[transform](self.table[0][transform]);
        }
      } else if (transform == 'all') {
        _each(self.table[0], function(column, index){
          if (index > 0) {
            self.table[0][index] = setup.cols.transform[transform](self.table[0][index]);
          }
        })
      }
    }
  }
  
  
  // ROW TRANSFORMS
  // ---------------------
  
  if (setup.rows.transform) {
    _each(self.table, function(row, index){
      if (index > 0) {
        for (var transform in setup.rows.transform) {
          self.table[index][transform] = setup.rows.transform[transform](self.table[index][transform]);
        }
      }
    })
  }
  
  //console.log(self.table);
  
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
  var self = this;
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
