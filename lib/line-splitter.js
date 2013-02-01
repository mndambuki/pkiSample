var Stream = require("stream").Stream,
    util = require("util");

// NOT A PROPER STREAM LOL

var LineSplitter = module.exports = function LineSplitter() {
  Stream.call(this);

  this.buffer = "";

  this.readable = true;
  this.writable = true;
};
util.inherits(LineSplitter, Stream);

LineSplitter.prototype.write = function write(data) {
  this.buffer += data;

  var lines = this.buffer.split("\n");
  this.buffer = lines.pop();

  lines.forEach(this.emit.bind(this, "data"));

  return true;
};
