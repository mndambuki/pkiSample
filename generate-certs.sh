#!/bin/bash

###
# Remove existing files
###

rm -rf ./working ./certs;

###
# Prepare directories
###

mkdir -p ./working ./certs;

###
# Create certificate authority
#
# Steps:
#   Create key
#   Create certificate signing request
#   Sign certificate with own key
###

openssl genrsa \
  -out ./working/certificate-authority.key 1024;

openssl req -new \
  -out ./working/certificate-authority.csr \
  -key ./working/certificate-authority.key \
  -config ./conf/certificate-authority.cnf;

openssl x509 -req \
  -out ./working/certificate-authority.crt \
  -in ./working/certificate-authority.csr \
  -signkey ./working/certificate-authority.key;

###
# Create server certificate
#
# Steps:
#   Create key
#   Create certificate signing request
#   Sign certificate with CA cert
#   Create PFX archive containing key, cert and CA cert for use in node
###

openssl genrsa \
  -out ./working/server.key 1024;

openssl req -new \
  -out ./working/server.csr \
  -key ./working/server.key \
  -config ./conf/server.cnf;

openssl x509 -req \
  -out ./working/server.crt \
  -in ./working/server.csr \
  -CA ./working/certificate-authority.crt \
  -CAkey ./working/certificate-authority.key \
  -CAserial ./working/certificate-authority.srl \
  -CAcreateserial;

openssl pkcs12 -export \
  -out ./certs/server.pfx \
  -passout pass: \
  -in ./working/server.crt \
  -inkey ./working/server.key \
  -certfile ./working/certificate-authority.crt;

###
# Create client-valid certificate
#
# Steps:
#   Create key
#   Create certificate signing request
#   Sign certificate with CA cert
#   Create PFX archive containing key and cert for use in node
###

openssl genrsa \
  -out ./working/client-valid.key 1024;

openssl req -new \
  -out ./working/client-valid.csr \
  -key ./working/client-valid.key \
  -config ./conf/client-valid.cnf;

openssl x509 -req \
  -out ./working/client-valid.crt \
  -in ./working/client-valid.csr \
  -CA ./working/certificate-authority.crt \
  -CAkey ./working/certificate-authority.key \
  -CAserial ./working/certificate-authority.srl \
  -CAcreateserial;

openssl pkcs12 -export \
  -out ./certs/client-valid.pfx \
  -passout pass: \
  -in ./working/client-valid.crt \
  -inkey ./working/client-valid.key;

###
# Create client-invalid certificate
#
# Steps:
#   Create key
#   Create certificate signing request
#   Sign certificate with own key
#   Create PFX archive containing key and cert for use in node
###

openssl genrsa \
  -out ./working/client-invalid.key 1024;

openssl req -new \
  -out ./working/client-invalid.csr \
  -key ./working/client-invalid.key \
  -config ./conf/client-invalid.cnf;

openssl x509 -req \
  -out ./working/client-invalid.crt \
  -in ./working/client-invalid.csr \
  -signkey ./working/client-invalid.key;

openssl pkcs12 -export \
  -out ./certs/client-invalid.pfx \
  -passout pass: \
  -in ./working/client-invalid.crt \
  -inkey ./working/client-invalid.key;
