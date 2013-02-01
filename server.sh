#!/bin/bash
openssl genrsa -out server.key 1024
openssl req -new -key server.key -out server.csr -config server.cnf
openssl x509 -req -in server.csr -signkey server.key -out server.crt 
openssl pkcs12 -export -in server.crt -inkey server.key -certfile server.crt -out server.pfx -config server.cnf
openssl x509 -noout -text -in server.crt