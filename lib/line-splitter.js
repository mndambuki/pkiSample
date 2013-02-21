var stream = require("stream"),
    util = require("util");

var LineSplitter = module.exports = function LineSplitter() {
  stream.Transform.call(this);

  this._line_buffer = "";
};
util.inherits(LineSplitter, stream.Transform);

LineSplitter.prototype._transform = function _transform(chunk, respond, done) {
  this._line_buffer += chunk;

  var lines = this._line_buffer.split("\n");
  this._line_buffer = lines.pop();

  lines.forEach(function(line) { respond(line); });

  return done();
};
