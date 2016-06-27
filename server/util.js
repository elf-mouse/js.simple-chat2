var model = require('./model');

var chatType = config.chatType;
var roleType = config.roleType;
var userModel = model.user;

/************************** 上线下线 ******************************/

function setLastId(socket, data) {
  if (data.length) {
    var lastMessage = data[data.length - 1];
    if (config.debug) {
      console.info('last id');
      console.log(socket.lastId);
      console.info('last message');
      console.log(lastMessage);
    }
    socket.lastId = lastMessage ? lastMessage._id : 0;
  }
}

function addUser(socket, user) {
  console.info('addUser');

  var roleName = config.roles[user.role];

  // for local
  socket.userIndex = userIds.length;
  for (var field in userModel) {
    var key = (field === 'id') ? userModel[field] : field;
    var value = user[field];
    socket[key] = value; // e.g. socket.username = user.username
  }
  socket.canLoad = true; // for load message
  socket.room = roleName;
  socket.join(roleName); // 分组

  // for global
  users.push(user); // origin user data
  var userId = socket[config.pk];
  userIds.push(userId); // new user id
  conns[userId] = socket.id;

  // db select
  db.readMessage(userId, null, function(data) {
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
      console.info('userIds');
      console.log(userIds);
      console.info('conns');
      console.log(conns);
    }
    // TODO: has some bug?
  } else {
    users.splice(socket.userIndex, 1);
    userIds.splice(socket.userIndex, 1);
    delete conns[socket[config.pk]];
    socket.leave(socket.room);
  }
}

/************************** 收发消息 ******************************/

function getReceiverById(senderId, receiverId) {
  var username = '';

  if (receiverId) {
    console.info('getReceiverById:' + senderId + '->' + receiverId);

    for (var user of users) {
      if (user.id == receiverId) {
        username = user[userModel.username];
        break;
      }

      if (user.id == senderId) {
        switch (user[userModel.role]) {
          case roleType.patient:
            if (user.binding[userModel.binding.id] == receiverId) {
              username = user.binding[userModel.binding.username];
            }
            break;
          case roleType.nurse:
            for (var binding of user.binding) {
              if (binding[userModel.binding.id] == receiverId) {
                username = binding[userModel.binding.username];
              }
            }
            break;
        }
        if (username) {
          break;
        }
      }
    }
  }

  return username;
}

function toEmit(socket, type, receiverId, data) {
  console.info('toEmit');

  var senderId = socket[config.pk];
  var sender = socket.username;

  if (senderId) { // sender已登录
    var socketId;
    var receiver = getReceiverById(senderId, receiverId);

    if (!receiver) {
      console.warn('[WARNING]no receiver be found');
    }

    switch (socket.role) {
      case roleType.patient:
        console.log('patient send a message');
        socketId = socket.binding && socket.binding.id ? conns[socket.binding.id] : null;
        break;
      case roleType.nurse:
        console.log('nurse send a message');
        socketId = conns[receiverId] || null;
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

    var value = {
      sender: senderId,
      receiver: receiverId,
      type: chatType.message,
      content: data
    };

    switch (type) {
      case config.chats[chatType.image]: // image
        console.log('[SendImage]Received image: ' + senderId + ':' + sender + ' to ' + receiverId + ':' + receiver + ' a pic');
        value.type = chatType.image;
        value.content = 'this is a image'; // TODO: save image
        break;
      default: // message
        console.log('[SendMessage]Received message: ' + senderId + ':' + sender + ' to ' + receiverId + ':' + receiver + ' say ' + value.content);
        break;
    }

    db.writeMessage(value); // insert db
  } else {
    console.log('user is unlogin');
  }
}

/************************** 登录后更新状态 ******************************/

function updateOnlineUser(socket, isOnline) {
  console.info('updateOnlineUser');

  var user = {
    id: socket[config.pk],
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

/************************** 接待用户 ******************************/

function isUniqueBinding(arr, data) {
  var result = true;

  for (var key in arr) {
    if (arr[key].id == data.id) {
      result = false;
      break;
    }
  }

  return result;
}

function updateUserBinding(socket, userId, bindingData, isNurse) {
  for (var index in users) {
    if (users[index].id == userId) {
      if (isNurse) {
        if (isUniqueBinding(users[index].binding, bindingData)) {
          users[index].binding.push(bindingData);
        }
      } else {
        users[index].binding = bindingData;
      }
      socket.binding = users[index].binding;
      break;
    }
  }
}

function call(socket, patient) {
  var binding = {
    nurse: {
      id: socket[config.pk],
      username: socket.username
    },
    patient: {
      id: patient.id,
      username: patient.username
    }
  };

  updateUserBinding(socket, binding.nurse.id, binding.patient, true);

  var patientSocketId = conns[binding.patient.id];
  if (patientSocketId) {
    updateUserBinding(io.sockets.connected[patientSocketId], binding.patient.id, binding.nurse, false);
  }

  if (config.debug) {
    console.info('nurse binding');
    console.log(socket.binding);
    console.info('patient binding');
    console.log(io.sockets.connected[patientSocketId].binding);
  }

  db.updateOfflineMessage(binding.patient.id, binding.nurse.id);
}

function callForwarding(userId, fromId, toId) {

}

/************************** export ******************************/

module.exports.setLastId = setLastId;
module.exports.addUser = addUser;
module.exports.clean = clean;
module.exports.toEmit = toEmit;
module.exports.updateOnlineUser = updateOnlineUser;
module.exports.getOnlineUser = getOnlineUser;
module.exports.call = call;
module.exports.callForwarding = callForwarding;
