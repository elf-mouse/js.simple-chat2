var chatType = config.chatType;
var roleType = config.roleType;

function addUser(socket, user) {
  console.info('addUser');

  socket.userIndex = usernameList.length;
  // socket.userId = user.id;
  socket.username = user.username;
  socket.role = user.role;
  socket.room = user.room;
  socket.join(user.room); // 分组

  users.push(user);
  usernameList.push(user.username);
  conns[user.username] = socket.id;

  socket.emit('loginSuccess');
}

function clean(socket) {
  if (typeof socket.userIndex !== 'undefined') { // important
    console.info('clean');

    users.splice(socket.userIndex, 1);
    usernameList.splice(socket.userIndex, 1);
    delete conns[socket.username];
    socket.leave(socket.room);
  }
}

function toEmit(socket, type, someone, data) {
  console.info('toEmit');

  var socketId = conns[someone] || null;
  var username = socket.username;

  if (socketId) {
    if (username) {
      io.sockets.connected[socketId].emit(type, username, data);

      var data = {
        sender: username,
        receiver: someone,
        type: chatType.message,
        content: data
      };

      switch (type) {
        case 'image':
          console.log('[sendImage]Received image: ' + username + ' to ' + someone + ' a pic');
          data.type = chatType.image;
          data.content = ''; // TODO: save image
          break;
        default: // message
          console.log('[sendMessage]Received message: ' + username + ' to ' + someone + ' say ' + data);
          break;
      }

      // insert db
      // db.writeMessage(data);
    } else {
      console.log(username + ' unlogin');
    }
  } else {
    console.log(someone + ' offline');
  }
}

function getOnlineUser(socket) {
  console.info('getOnlineUser');

  var onlineUsers = [];
  for (var user of users) {
    if (config.debug) {
      console.log(user.role + ':' + roleType.patient);
      console.log(user.role === roleType.patient);
    }
    if (user.role === roleType.patient) {
      onlineUsers.push(user.username);
    }
  }

  if (config.debug) {
    console.log(socket.role);
    console.log(onlineUsers);
  }

  switch (socket.role) {
    case roleType.patient:
      socket.to(rooms[roleType.doctor]).emit('onlineStatus', onlineUsers);
      break;
    case roleType.doctor:
      io.sockets.in(rooms[roleType.doctor]).emit('onlineStatus', onlineUsers);
      break;
  }
}

module.exports.addUser = addUser;
module.exports.clean = clean;
module.exports.toEmit = toEmit;
module.exports.getOnlineUser = getOnlineUser;
