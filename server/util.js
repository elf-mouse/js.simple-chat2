var chatType = config.chatType;
var roleType = config.roleType;

function setLastId(socket, data) {
  var lastMessage = data[data.length - 1];
  if (config.debug) {
    console.info('last id');
    console.log(socket.lastId);
    console.info('last message');
    console.log(lastMessage);
  }
  socket.lastId = lastMessage ? lastMessage._id : 0;
}

function addUser(socket, user) {
  console.info('addUser');

  var roleName = config.roles[user.role];
  var model = config.model[roleName];

  // for local
  socket.userIndex = usernameList.length;
  for (var field in model) {
    var key = (field === 'id') ? ('_' + field) : field; // important
    var value = user[field];
    socket[key] = value; // e.g. socket.username = user.username
  }
  socket.canLoad = true; // for load message
  socket.room = roleName;
  socket.join(roleName); // 分组

  // for global
  users.push(user);
  usernameList.push(socket.username);
  conns[socket.username] = socket.id;

  // db select
  db.readMessage(socket.username, null, function(data) {
    setLastId(socket, data);
    socket.emit('loginSuccess', data);
  });
}

function clean(socket) {
  console.info('clean');

  if (typeof socket.userIndex === 'undefined') { // important
    if (config.debug) {
      console.info('users');
      console.log(users);
      console.info('username list');
      console.log(usernameList);
      console.info('conns');
      console.log(conns);
    }
    // TODO: has some bug?
  } else {
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
    var canSave = true;
    var socketId;

    if (typeof receiver !== 'string') {
      canSave = false;
      console.warn('[WARNING]receiver must be a string');
    }

    switch (socket.role) {
      case roleType.patient:
        console.log('patient send a message');
        socketId = socket.binding ? conns[socket.binding[config.model.patient.binding.username]] : null;
        break;
      case roleType.nurse:
        console.log('nurse send a message');
        socketId = conns[receiver] || null;
        break;
    }

    if (socketId) { // receiver在线
      io.sockets.connected[socketId].emit(type, sender, data);
    } else { // receiver离线
      console.log('user is offline');

      if (socket.role === roleType.patient) {
        socket.to(config.roles[roleType.nurse]).emit(type, sender, data);
      }
    }

    if (canSave) {
      var data = {
        sender: sender,
        receiver: receiver,
        type: chatType.message,
        content: data
      };

      switch (type) {
        case config.chats[chatType.image]: // image
          console.log('[SendImage]Received image: ' + sender + ' to ' + receiver + ' a pic');
          data.type = chatType.image;
          data.content = 'this is a image'; // TODO: save image
          break;
        default: // message
          console.log('[SendMessage]Received message: ' + sender + ' to ' + receiver + ' say ' + data);
          break;
      }

      db.writeMessage(data); // insert db
    }
  } else {
    console.log('user is unlogin');
  }
}

function updateOnlineUser(socket, isOnline) {
  console.info('updateOnlineUser');

  var user = {
    username: socket.username,
    isOnline: isOnline
  };

  if (config.debug) {
    // console.log(config.roles[roleType.nurse]);
    console.log(user);
  }

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
    // console.log(socket.role);
    console.log(onlineUsers);
  }

  socket.emit('getOnlineUser', onlineUsers);
}

module.exports.setLastId = setLastId;
module.exports.addUser = addUser;
module.exports.clean = clean;
module.exports.toEmit = toEmit;
module.exports.updateOnlineUser = updateOnlineUser;
module.exports.getOnlineUser = getOnlineUser;
