global.config = require('./server/config');
global.db = require('./server/db/chat');
global.io = require('socket.io')(config.server.port);
global.users = []; // user data
global.userIds = []; // userId list
global.conns = {}; // userId:socketId object

var util = require('./server/util');
var chatType = config.chatType;
var roleType = config.roleType;

io.on('connection', function(socket) {
  console.log('[Connection]Connection ' + socket.id + ' accepted.');

  socket.on('login', function(user) { // user: json object
    user.role = +user.role; // important
    var role = user.role;
    var userId = user.id;
    var username = user.username;

    if (userIds.indexOf(userId) > -1) {
      console.log('[Login][' + role + ']' + userId + ':' + username + ' is existed');

      socket.emit('userExisted');

      // fix clean bug
      if (!conns[userId]) {
        console.warn('[WARNING]bugfix');
        for (var index in users) {
          if (users[index][config.pk] === userId) {
            users.splice(index, 1);
            break;
          }
        }
        for (var index in userIds) {
          if (userIds[index] === userId) {
            userIds.splice(index, 1);
            break;
          }
        }
      }
    } else {
      console.log('[Login][' + role + ']' + userId + ':' + username + ' sign in');

      util.addUser(socket, user);

      switch (role) {
        case roleType.patient:
          util.updateOnlineUser(socket, true); // online
          break;
        case roleType.nurse:
          util.getOnlineUser(socket);
          break;
      }
    }
  });

  socket.on('disconnect', function() {
    console.log('[Disconnect]Connection ' + socket.id + ' terminated.');

    util.clean(socket);

    if (socket.role === roleType.patient) {
      util.updateOnlineUser(socket, false); // offline
    }

    // socket.broadcast.emit('system', socket.username, userIds.length, 'disconnect');
  });

  socket.on('status', function() {
    console.log('[Status]' + socket.id);
    socket.emit('status', socket[config.pk] + ':' + socket.username, userIds);
  });

  socket.on('message', function(receiverId, message) {
    util.toEmit(socket, config.chats[chatType.message], receiverId, message);
  });

  socket.on('image', function(receiverId, imgData) {
    util.toEmit(socket, config.chats[chatType.image], receiverId, imgData);
  });

  socket.on('loadMessage', function() {
    if (socket.canLoad) {
      if (config.debug) {
        console.info('loadMessage');
        console.log('username:' + socket.username + ',lastId:' + socket.lastId);
      }
      if (socket.lastId) {
        db.readMessage(socket.id, socket.lastId, function(data) {
          util.setLastId(socket, data);
          socket.emit('loadMessage', data);
        });
      } else {
        socket.canLoad = false;
      }
    } else {
      console.warn('no more message');
    }
  });

  socket.on('callForwarding', function(fromId, toId) {
    console.info('[Call Forwarding]' + fromId + ':' + toId);
    util.callForwarding(fromId, toId);
  });

});
