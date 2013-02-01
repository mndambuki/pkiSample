#!/usr/bin/env node

var fs = require("fs"),
    tls = require("tls"),
    util = require("util");

var options = {
  pfx: fs.readFileSync("server.pfx"),
  requestCert: true//,
  // rejectUnauthorized: true
};

var clients = [];
var server = tls.createServer(options, function(cleartextStream) {
  clients.push(cleartextStream);

  // console.log(cleartextStream.getPeerCertificate());

  cleartextStream.on("data", function(chunk) {
    clients.filter(function(e) { return e !== cleartextStream; }).forEach(function(e) {
      if (e.authorized === true) {
        e.write("<from authorized> ");
      }
      else {
        e.write("<from unauthorized> ");
      }
      //e.write(util.inspect(e));
      e.write(chunk);
    });
  });

  var removed = false;
  var on_end = function on_end() {
    if (removed) {
      return;
    }

    clients.splice(clients.indexOf(cleartextStream));
  };
  cleartextStream.on("end", on_end);
  cleartextStream.on("error", on_end);
});

var createClient = function createClient(name, address, cert) {
  var options = {port: address.port};
  if (cert) {
    options.pfx = fs.readFileSync(cert);
  }
  var conn = tls.connect(options, function() {
    conn.on("data", function(chunk) {
      console.log(name, ">>", chunk.toString());
    });
  });

  return {name: name, conn: conn};
};

// fake some clients
server.listen(function() {
  console.log(this.address());
  var clients = [];

  clients.push(createClient('valid', this.address(), "valid-client.pfx"));
  clients.push(createClient('invalid', this.address(), "invalid-client.pfx"));
  clients.push(createClient('cleartext', this.address()));

  clients[0].conn.write("herro\n");
  clients[1].conn.write("привет\n");
  clients[2].conn.write("scammer alert ^\n");
//  clients[0].conn.write("lol\n");
});
