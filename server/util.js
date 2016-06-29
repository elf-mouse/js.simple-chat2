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
    socket.lastId = lastMessage ? lastMessage.id : 0;
  }
}

function getUserModelKeys() {
  var keys = [];
  for (var key in userModel) {
    keys.push(key);
  }
  return keys;
}

function addUser(socket, user) {
  console.info('addUser');

  var userModelKeys = getUserModelKeys();

  // for local
  var allow = false;
  for (var field in userModel) {
    if (userModelKeys.indexOf(field) > -1) { // 检查数据格式
      allow = true;
      var key = (field === 'id' || field === 'type') ? userModel[field] : field;
      var value = user[field];
      socket[key] = value; // e.g. socket.username = user.username
    }
  }

  if (allow) {
    var roleName = config.roles[user.role];

    socket.userIndex = userIds.length;
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
  } else {
    socket.emit('system', 'disallow');
  }
}

function clean(socket) {
  console.info('clean');

  if (typeof socket.userIndex === 'undefined') { // important
    console.warn('userIndex is undefined');
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

function saveFile(value, data) {
  var date = new Date();
  // path to store uploaded files (NOTE: presumed you have created the folders)
  var filename = date.getTime() + '.png';

  var base64Data = data.replace(/^data:image\/png;base64,/, '');
  require('fs').writeFile(config.uploadDir + filename, base64Data, 'base64', function(err) {
    if (err) {
      throw err;
    }
    value.content = filename;
    db.writeMessage(value); // insert db
    console.log('File saved successful!');
  });
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
      io.sockets.connected[socketId].emit(type, senderId, data);
    } else { // receiver离线
      console.log('user is offline');

      if (socket.role === roleType.patient) {
        socket.to(config.roles[roleType.nurse]).emit(type, senderId, data);
      }
    }

    var value = {
      sender_id: senderId,
      receiver_id: receiverId,
      chat_type: chatType.message,
      content: data
    };

    switch (type) {
      case config.chats[chatType.image]: // image
        console.log('[SendImage]Received image: ' + senderId + ':' + sender + ' to ' + receiverId + ':' + receiver + ' a pic');
        value.chat_type = chatType.image;
        // 保持图片至本地
        saveFile(value, data);
        break;
      default: // message
        console.log('[SendMessage]Received message: ' + senderId + ':' + sender + ' to ' + receiverId + ':' + receiver + ' say ' + value.content);
        db.writeMessage(value); // insert db
        break;
    }
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
  var result = -1;

  for (var key in arr) {
    if (arr[key].id == data.id) {
      result = key;
      break;
    }
  }

  return result;
}

function updateUserBinding(socket, data, isDelete) {
  isDelete = isDelete || false;

  for (var index in users) {
    if (users[index].id == data.userId) {

      if (data.isNurse) {
        var result = isUniqueBinding(users[index].binding, data.binding);
        if (isDelete) { // 删除
          if (result > -1) {
            users[index].binding.splice(result, 1);
          }
        } else { // 新增
          if (result == -1) {
            users[index].binding.push(data.binding);
          }
        }
      } else {
        users[index].binding = data.binding; // 新增/修改
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

  updateUserBinding(socket, {
    userId: binding.nurse.id,
    binding: binding.patient,
    isNurse: true
  });

  if (config.debug) {
    console.info('nurse binding');
    console.log(socket.binding);
  }

  var patientSocketId = conns[binding.patient.id];
  if (patientSocketId) {
    updateUserBinding(io.sockets.connected[patientSocketId], {
      userId: binding.patient.id,
      binding: binding.nurse,
      isNurse: false
    });

    if (config.debug) {
      console.info('patient binding');
      console.log(io.sockets.connected[patientSocketId].binding);
    }
  }

  db.updateOfflineMessage(binding.patient.id, binding.nurse.id);
}

function callForwarding(socket, patient, nurse) {
  var binding = {
    fromNurse: {
      id: socket[config.pk],
      username: socket.username
    },
    patient: {
      id: patient.id,
      username: patient.username
    },
    toNurse: {
      id: nurse.id,
      username: nurse.username
    }
  };

  updateUserBinding(socket, {
    userId: binding.fromNurse.id,
    binding: binding.patient,
    isNurse: true
  }, true);

  if (config.debug) {
    console.info('from nurse binding');
    console.log(socket.binding);
  }

  var patientSocketId = conns[binding.patient.id];
  if (patientSocketId) {
    updateUserBinding(io.sockets.connected[patientSocketId], {
      userId: binding.patient.id,
      binding: binding.toNurse,
      isNurse: false
    });

    if (config.debug) {
      console.info('patient binding');
      console.log(io.sockets.connected[patientSocketId].binding);
    }
  }

  var nurseSocketId = conns[binding.toNurse.id];
  if (nurseSocketId) {
    updateUserBinding(io.sockets.connected[nurseSocketId], {
      userId: binding.toNurse.id,
      binding: binding.patient,
      isNurse: true
    });
    // 转接通知
    io.sockets.connected[nurseSocketId].emit('callForwarding', {
      nurse: binding.fromNurse,
      patient: binding.patient
    });

    if (config.debug) {
      console.info('to nurse binding');
      console.log(io.sockets.connected[nurseSocketId].binding);
    }
  }
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
