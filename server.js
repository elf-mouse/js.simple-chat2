global.config = require('./server/config');
global.db = require('./server/db');
global.io = require('socket.io')(config.server.port);
global.rooms = config.rooms;
global.users = [];
global.usernameList = []; // username list
global.conns = {}; // username:socket object

var util = require('./server/util');

io.on('connection', function(socket) {
  console.log('[Connection]Connection ' + socket.id + ' accepted.');

  socket.on('login', function(user) { // user: json object
    user.role = +user.role; // important
    var role = +user.role;
    var username = user.username;

    if (usernameList.indexOf(username) > -1) {
      console.log('[Login][' + role + ']' + username + ' is existed');

      socket.emit('userExisted');
    } else {
      console.log('[Login][' + role + ']' + username + ' sign in');

      user.room = rooms[role];

      util.addUser(socket, user);
      util.getOnlineUser(socket);
    }
  });

  socket.on('disconnect', function() {
    console.log('[Disconnect]Connection ' + socket.id + ' terminated.');

    util.clean(socket);
    if (socket.role === config.roleType.patient) {
      util.getOnlineUser(socket);
    }

    // socket.broadcast.emit('system', socket.username, usernameList.length, 'disconnect');
  });

  socket.on('status', function() {
    console.log('[Status]' + socket.id);
    socket.emit('status', usernameList);
  });

  socket.on('message', function(someone, message) {
    util.toEmit(socket, 'message', someone, message);
  });

  socket.on('image', function(someone, imgData) {
    util.toEmit(socket, 'image', someone, imgData);
  });
});
