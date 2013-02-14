////
// The following example assumes both users have authenticated with a sonarjs
// instance using their existing certs
// 
// This demonstrates how users will communicate privately without allowing
// the server to listen
////

var crypto = require('crypto');

// random mod
var randomModulus = function randomModulus() {
  var mods = [
    'modp1', 'modp2', 'modp5', 'modp14',
    'modp15', 'modp16', 'modp17', 'modp18'
  ];
  return mods[Math.floor(Math.random()*mods.length)];
};



var User = function User(name, mod) {
  this.name = name;

  // generate keys
  this.gen = crypto.getDiffieHellman(mod);
  this.gen.generateKeys();
  this.publicKey = this.gen.getPublicKey('base64');
  this.privateKey = this.gen.getPrivateKey('base64');
};

User.prototype.computeSecret = function computeSecret(otherKey) {
  return this.secret = this.gen.computeSecret(otherKey, 'base64', 'base64');
};

User.prototype.encode = function encode(message) {
  var cipher = crypto.createCipher('aes256', this.secret);
  cipher.update(message, 'utf8', 'base64');
  return cipher.final('base64')
};

User.prototype.decode = function decode(message) {
  var decipher = crypto.createDecipher('aes256', this.secret);
  decipher.update(message, 'base64', 'utf8');
  return decipher.final('utf8');
};

// bob initializes p2p connection
var mod = randomModulus();
var bob = new User('bob', mod);
var init = {command: 'p2pinit', to: 'alice', modulus: mod, publicKey: bob.publicKey};
// bob sends init message
// bob => {init} => sonarjs => {init} => alice

// alice receives init message
var alice = new User('alice', init.modulus);
alice.computeSecret(init.publicKey);
var shake = {command: 'p2phandshake', to: 'bob', publicKey: alice.publicKey};
// alice sends handshake message
// alice => {shake} => sonarjs => {shake} => bob

// bob receives handshake message
bob.computeSecret(shake.publicKey);

// bob and alice are secure!
// console.log(bob.secret === alice.secret);

// bob sends his first message
var str = 'hello';
console.log("bob writes: " + str);
var msg1 = {command: 'message', to: 'alice', body: bob.encode(str)};
// bob => {cipheredMessage} => sonarjs => {cipheredMessage} => alice

// alice receives ciphered message
console.log("alice receives: " + msg1.body);
console.log("alice decodes to: " + alice.decode(msg1.body));

// alice replies!
str = 'ohai!';
console.log("alice writes: " + str);
var msg2 = {command: 'message', to: 'bob', body: alice.encode(str)};

// bob receives ciphered message
console.log("bob receives: " + msg2.body);
console.log("bob decodes to: " + bob.decode(msg2.body));