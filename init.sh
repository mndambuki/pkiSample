rm *.{key,csr,crt,pfx}
printf "\n\nSERVER\n"
./server.sh

printf "\n\nVALID CLIENT\n"
./valid-client.sh

printf "\n\nINVALID CLIENT\n"
./invalid-client.sh
