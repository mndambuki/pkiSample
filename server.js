#!/usr/bin/env node

var fs = require("fs"),
    tls = require("tls");

var LineSplitter = require("./lib/line-splitter");

var server_options = {
  pfx: fs.readFileSync("./certs/server.pfx"),
  requestCert: true,
};

var server_clients = [];
var server = tls.createServer(server_options, function(cleartextStream) {
  server_clients.push(cleartextStream);

  var cert = cleartextStream.getPeerCertificate();

  var username = [
    (cleartextStream.authorized ? "○" : "×"),
    ((cert && cert.subject && cert.subject.CN) ? cert.subject.CN : "anonymous"),
    ">",
  ].join(":");

  cleartextStream.pipe(new LineSplitter()).on("data", function(line) {
    server_clients.filter(function(e) { return e !== cleartextStream; }).forEach(function(e) {
      e.write(username + " " + line + "\n");
    });
  });

  var removed = false;
  var on_end = function on_end() {
    if (removed) {
      return;
    }

    server_clients.splice(server_clients.indexOf(cleartextStream));
  };
  cleartextStream.on("end", on_end);
  cleartextStream.on("error", on_end);
});

// fake some clients
server.listen(function() {
  var address = this.address();

  var clients = [
    ["valid", "./certs/client-valid.pfx"],
    ["invalid", "./certs/client-invalid.pfx"],
    ["none"],
  ].map(function(e) {
    var options = {port: address.port};

    if (e[1]) {
      options.pfx = fs.readFileSync(e[1]);
    }

    var conn = tls.connect(options, function() {
      conn.pipe(new LineSplitter()).on("data", function(line) {
        console.log(line, ">>", e[0]);
      });
    });

    return {name: e[0], conn: conn};
  });

  setTimeout(function() { clients[0].conn.write("herro\n");           }, 100);
  setTimeout(function() { clients[1].conn.write("привет\n");          }, 200);
  setTimeout(function() { clients[2].conn.write("scammer alert ^\n"); }, 300);
});
