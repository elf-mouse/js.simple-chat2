var chatType = config.chatType;
var roleType = config.roleType;

function addUser(socket, user) {
  console.info('addUser');

  socket.userIndex = usernameList.length;
  // socket.userId = user.id;
  socket.username = user.username;
  socket.role = user.role;
  socket.binding = user.binding || ''; // 绑定关系
  socket.room = user.room;
  socket.join(user.room); // 分组

  // for global
  users.push(user);
  usernameList.push(user.username);
  conns[user.username] = socket.id;

  socket.emit('loginSuccess');
}

function clean(socket) {
  console.info('clean');

  console.log(typeof socket.userIndex);

  if (typeof socket.userIndex !== 'undefined') { // important
    users.splice(socket.userIndex, 1);
    usernameList.splice(socket.userIndex, 1);
    delete conns[socket.username];
    socket.leave(socket.room);
  }
}

function toEmit(socket, type, receiver, data) {
  console.info('toEmit');

  var sender = socket.username;

  if (sender) { // sender已登录
    var socketId;

    switch (socket.role) {
      case roleType.patient:
        socketId = socket.binding ? conns[socket.binding.nurseName] : null;
        break;
      case roleType.nurse:
        socketId = conns[receiver] || null;
        break;
    }

    if (socketId) { // receiver在线
      io.sockets.connected[socketId].emit(type, sender, data);

      var data = {
        sender: sender,
        receiver: receiver,
        type: chatType.message,
        content: data
      };

      switch (type) {
        case config.chats[chatType.image]: // image
          console.log('[sendImage]Received image: ' + sender + ' to ' + receiver + ' a pic');
          data.type = chatType.image;
          data.content = 'this is a image'; // TODO: save image
          break;
        default: // message
          console.log('[sendMessage]Received message: ' + sender + ' to ' + receiver + ' say ' + data);
          break;
      }

      // insert db
      // db.writeMessage(data);
    } else { // receiver离线
      console.log(receiver + ' is offline');

      if (socket.role === roleType.patient) {
        socket.to(config.roles[roleType.nurse]).emit(type, sender, data);
      }
    }
  } else {
    console.log(sender + ' is unlogin');
  }
}

function updateOnlineUser(socket, isOnline) {
  console.info('updateOnlineUser');

  var user = {
    username: socket.username,
    isOnline: isOnline
  };

  socket.to(config.roles[roleType.nurse]).emit('updateOnlineUser', user);
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

  socket.emit('getOnlineUser', onlineUsers);
}

module.exports.addUser = addUser;
module.exports.clean = clean;
module.exports.toEmit = toEmit;
module.exports.updateOnlineUser = updateOnlineUser;
module.exports.getOnlineUser = getOnlineUser;
