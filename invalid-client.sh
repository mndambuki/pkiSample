#!/bin/bash
openssl genrsa -out invalid-client.key 1024
openssl req -new -key invalid-client.key -out invalid-client.csr -config invalid-client.cnf
openssl x509 -req -in invalid-client.csr -signkey invalid-client.key -out invalid-client.crt 
openssl pkcs12 -export -in invalid-client.crt -inkey invalid-client.key -certfile invalid-client.crt -out invalid-client.pfx
openssl x509 -noout -text -in invalid-client.crt