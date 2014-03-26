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
    index: setup.cols.index.split(" -> "),
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
    var index = [self.cols.index];
    var cells = parse.apply(self, [root[0]].concat(self.cols.cells));
    self.table.push(index.concat(cells));
    _each(cells, function(el, index){
      self.series.push({ key: el, values: [] });
    });
  })();
  
  // Rows
  _each(root, function(el, i){
    var index = parse.apply(self, [el].concat(self.rows.index));
    var cells = parse.apply(self, [el].concat(self.rows.cells));
    self.table.push(index.concat(cells));
    _each(self.series, function(series, j){
      series['values'].push(cells[j]);
    });
    if (setup.rows.transform) {
      for (var row in setup.rows.transform) {
        if (self.table[i+1].length > row) {
          self.table[i+1][row] = setup.rows.transform[row](self.table[i+1][row]);
        }
      }
    }
    console.log(self.table[i+1]);
    
    
  });
  
  return this;
};
flatten.prototype.render = function(format){
  if (format == 'csv') {
    console.log(this.table.join('\n'));
  }
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
