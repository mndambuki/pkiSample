#!/bin/bash
openssl genrsa -out valid-client.key 1024
openssl req -new -key valid-client.key -out valid-client.csr -config valid-client.cnf
openssl x509 -req -in valid-client.csr -signkey valid-client.key -CA server.crt -CAkey server.key -CAcreateserial -out valid-client.crt
openssl pkcs12 -export -in valid-client.crt -inkey valid-client.key -certfile valid-client.crt -out valid-client.pfx
openssl x509 -noout -text -in valid-client.crt
