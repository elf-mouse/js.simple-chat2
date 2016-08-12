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
    var key;
    var value;
    if (userModelKeys.indexOf(field) > -1) { // 检查数据格式
      allow = true;
      if (typeof userModel[field] === 'string') {
        key = userModel[field];
        value = user[field];
        socket[key] = value; // e.g. socket.username = user.name
      } else {
        socket[field] = {}; // e.g. socket.binding = {}
        for (var field2 in userModel[field]) {
          key = userModel[field][field2];
          value = user[field][field2];
          socket[field][key] = value;
        }
      }
    }
  }

  if (!socket.role) {
    allow = false;
    console.error('undefined role');
  }

  if (userIds.indexOf(socket[config.pk]) > -1) {
    allow = false;
    console.error('user is login');
  }

  if (allow) {
    var roleName = config.roles[user.type];

    socket.room = roleName;
    socket.join(roleName); // 分组
    socket.canLoad = true; // for load message

    // for global
    var userId = socket[config.pk];
    userIds.push(userId); // new user id
    users[userId] = user; // origin user data
    conns[userId] = socket.id; // client id
    if (user.type === config.roleType.nurse) {
      socket.currentPatientId = 0; // 当前聊天患者ID
    }

    console.log(util.now() + 'register===========================');
    if (config.debug) {
      console.info('userIds');
      console.log(userIds);
      console.info('users');
      console.log(users);
      console.info('conns');
      console.log(conns);
    }
    console.log('register end===========================');

    // db select
    if (user.type === config.roleType.nurse) {
      console.log('nurse get message');
      // DB.query.getOfflineMessageCount(function(data) { // 秘书登录后获取全部离线消息统计
      //   if (config.debug) {
      //     console.log(1, 'offline message', data);
      //   }
        DB.store.getAll(0, function(res) { // 全部未读消息
          // var result = data.concat(res).uniqueId();
          if (config.debug) {
            console.log(2, 'unread message', res);
          }
          // console.log(3, 'get message', res);
          // response
          socket.emit('loginSuccess', res);
        });
      // });
    } else {
      console.log('patient get message');
      DB.query.getPatientMessage(userId, null, function(data) { // 患者登录后获取最近几条聊天记录
        util.setLastId(socket, data);
        if (config.debug) {
          console.log(1, 'history message', data);
        }
        DB.query.getAutoreply(function(res) {
          if (config.debug) {
            console.log(2, 'autoreply message', res);
          }
          var result = util.appendAutoreply(userId, data, res);
          // console.log(3, 'get message', result);

          // response
          socket.emit('loginSuccess', result);
        });
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
  var username = user.name;

  // 防止设备重复登录
  var uniqueDevice = true;
  for (var userId in conns) {
    if (conns[userId] === socket.id) {
      uniqueDevice = false;
      break;
    }
  }

  if (uniqueDevice) {
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
    console.log(util.now() + '[Login]device is login');
    // response
    socket.emit('userExisted');
  }
};
