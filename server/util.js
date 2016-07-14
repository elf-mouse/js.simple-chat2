var disconnect = require('./event/disconnect');

var roleType = config.roleType;

/**
 * 时间对象的格式化
 * @format YYYY-mm-dd HH:mm:ss
 * @usage var now = new Date().format('YYYY-mm-dd HH:ii:ss');
 */
Date.prototype.format = function(format) {
  var o = {
    'm+': this.getMonth() + 1, // month
    'd+': this.getDate(), // day
    'H+': this.getHours(), // hour
    'i+': this.getMinutes(), // minute
    's+': this.getSeconds(), // second
    'q+': Math.floor((this.getMonth() + 3) / 3), // quarter
    'S': this.getMilliseconds() // millisecond
  }

  if (/(Y+)/.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear() + '')
      .substr(4 - RegExp.$1.length));
  }

  for (var k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
    }
  }
  return format;
};

function now() {
  return '[' + (new Date()).format('YYYY-mm-dd HH:ii:ss') + ']';
}

function checkAuth(socket, fn) {
  var currentTime = new Date().getTime();
  if (socket && socket.auth && currentTime < socket.authExpiry) {
    fn();
  } else {
    console.error('auth:disallow');
    // response
    socket.emit('system', 'disallow');
    // 关闭连接
    disconnect(socket);
  }
}

/************************** 登录后更新状态 ******************************/

function updateOnlineUser(socket, isOnline) {
  console.info(now() + 'updateOnlineUser');

  var user = {
    id: socket[config.pk],
    username: socket.username,
    isOnline: isOnline
  };

  if (config.debug) {
    console.log(user);
  }
  // response
  socket.to(config.roles[roleType.nurse]).emit('updateOnlineUser', user);
}

function getOnlineUser(socket) {
  console.info(now() + 'getOnlineUser');

  var onlineUsers = [];
  for (var key in users) {
    var user = users[key];
    if (config.debug) {
      console.log(user.type + ':' + roleType.patient);
      console.log(user.type === roleType.patient);
    }
    if (user.type === roleType.patient) {
      onlineUsers.push(user.username);
    }
  }

  if (config.debug) {
    console.log(onlineUsers);
  }
  // response
  socket.emit('getOnlineUser', onlineUsers);
}

/************************** 更多消息相关 ******************************/

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
  console.info(now() + 'updateUserBinding');

  isDelete = isDelete || false;

  for (var key in users) {
    var user = users[key];
    if (user.id == data.userId) {

      if (data.isNurse) {
        var result = isUniqueBinding(user.binding, data.binding);
        if (isDelete) { // 删除
          if (result > -1) {
            user.binding.splice(result, 1);
          }
        } else { // 新增
          if (result === -1) {
            user.binding.push(data.binding);
          }
        }
      } else {
        user.binding = data.binding; // 新增/修改
      }

      users[key].binding = user.binding;
      socket.binding = user.binding;

      break;
    }
  }
}

/************************** 处理未读消息 ******************************/

function updateUnread(socket, patientId, reset) {
  console.info(now() + 'updateUnread');

  if (config.debug) {
    console.log('patientId:' + patientId);
    console.log('currentBindingId:' + socket.currentBindingId);
  }

  reset = reset || false;

  if (reset || !patientId || patientId === socket.currentBindingId) {
    console.log('=0');
    socket.unread[patientId] = 0;
  } else {
    if (!socket.unread[patientId]) {
      console.log('=1');
      socket.unread[patientId] = 1;
    } else {
      console.log('+=1');
      socket.unread[patientId] += 1;
    }
  }

  console.log(socket.unread[patientId]);

  return socket.unread[patientId];
}

/************************** export ******************************/

module.exports.now = now;
module.exports.checkAuth = checkAuth;
module.exports.setLastId = setLastId;
module.exports.updateOnlineUser = updateOnlineUser;
module.exports.getOnlineUser = getOnlineUser;
module.exports.updateUserBinding = updateUserBinding;
module.exports.updateUnread = updateUnread;
