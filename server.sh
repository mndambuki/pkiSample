#!/bin/bash
openssl genrsa -out server.key 1024
openssl req -new -x509 -key server.key -out server.crt -config server.cnf
openssl x509 -noout -text -in server.crt