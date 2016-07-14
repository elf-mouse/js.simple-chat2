var model = require('../model');

var userModel = model.user;

function getUserModelKeys() {
  var keys = [];
  for (var key in userModel) {
    keys.push(key);
  }
  return keys;
}

function addUser(socket, user) {
  console.info(util.now() + 'addUser');

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
    var roleName = config.roles[user.type];

    socket.room = roleName;
    socket.join(roleName); // 分组
    socket.canLoad = true; // for load message
    if (user.type === config.roleType.nurse) {
      socket.currentBindingId = 0; // 当前聊天对象ID
      socket.unread = {}; // 未读消息
    }

    // for global
    var userId = socket[config.pk];
    userIds.push(userId); // new user id
    users[userId] = user; // origin user data
    conns[userId] = socket.id; // client id
    if (user.type === config.roleType.patient) {
      offlineMessage[userId] = 0; // 设置离线未读消息数
    }

    // console.log(util.now() + 'register===========================');
    // if (config.debug) {
    //   console.info('userIds');
    //   console.log(userIds);
    //   console.info('users');
    //   console.log(users);
    //   console.info('conns');
    //   console.log(conns);
    // }

    // db select
    if (user.type === config.roleType.nurse) {
      console.log('nurse get message');
      db.getAllOfflineMessage(function(data) { // 秘书登录后获取全部离线消息
        // response
        socket.emit('loginSuccess', data);
      });
    } else {
      console.log('patient get message');
      db.getPatientMessage(userId, null, function(data) { // 患者登录后获取最近几条聊天记录
        util.setLastId(socket, data);
        // response
        socket.emit('loginSuccess', data);
      });
    }
  } else {
    console.error('login:disallow');
    // response
    socket.emit('system', config.system.login.disallow);
  }
}

module.exports = function(socket, user) {
  user.type = +user.type; // important
  var role = user.type;
  var userId = user.id;
  var username = user.username;

  // 防止设备重复登录
  var uniqueDevice = true;
  for (var userId in conns) {
    if (conns[userId] === socket.id) {
      uniqueDevice = false;
      break;
    }
  }

  var canLogin = uniqueDevice && userIds.indexOf(userId) === -1;
  if (canLogin) {
    console.log(util.now() + '[Login][' + config.roles[role] + ']' + userId + ':' + username + ' sign in');

    addUser(socket, user);

    switch (role) {
      case config.roleType.patient:
        util.updateOnlineUser(socket, true); // online
        break;
      case config.roleType.nurse:
        util.getOnlineUser(socket);
        break;
    }
  } else {
    console.log(util.now() + '[Login]user is existed');
    // response
    socket.emit('userExisted');
  }
};
