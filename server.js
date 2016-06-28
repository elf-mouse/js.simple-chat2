global.config = require('./server/config');
global.db = require('./server/db/chat');
global.io = require('socket.io')(config.server.port);
global.users = []; // 用户数据
global.userIds = []; // 用户ID列表
global.conns = {}; // 连接集合{userId:socketId}

var util = require('./server/util');
var chatType = config.chatType;
var roleType = config.roleType;

io.on('connection', function(socket) {
  console.log('[Connection]Connection ' + socket.id + ' accepted.');

  /**
   * 登录
   */
  socket.on('login', function(user) { // user: json object
    user.role = +user.role; // important
    var role = user.role;
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
    } else {
      console.log('[Login]user is existed');

      socket.emit('userExisted');

      // fix clean bug
      // if (!conns[userId]) {
      //   console.warn('[WARNING]bugfix');
      //   for (var index in users) {
      //     if (users[index][config.pk] === userId) {
      //       users.splice(index, 1);
      //       break;
      //     }
      //   }
      //   for (var index in userIds) {
      //     if (userIds[index] === userId) {
      //       userIds.splice(index, 1);
      //       break;
      //     }
      //   }
      // }
    }
  });

  /**
   * 离线
   */
  socket.on('disconnect', function() {
    console.log('[Disconnect]Connection ' + socket.id + ' terminated.');

    util.clean(socket);

    if (socket.role === roleType.patient) {
      util.updateOnlineUser(socket, false); // offline
    }
  });

  /**
   * 获取当前状态
   */
  socket.on('status', function() {
    console.log('[Status]' + socket.id);
    socket.emit('status', socket[config.pk] + ':' + socket.username, userIds);
  });

  /**
   * 发消息
   */
  socket.on('message', function(receiverId, message) {
    util.toEmit(socket, config.chats[chatType.message], receiverId, message);
  });

  /**
   * 发图片
   */
  socket.on('image', function(receiverId, imgData) {
    util.toEmit(socket, config.chats[chatType.image], receiverId, imgData);
  });

  /**
   * 加载更多消息
   */
  socket.on('loadMessage', function() {
    if (socket.canLoad) {
      if (config.debug) {
        console.info('loadMessage');
        console.log('username:' + socket.username + ',lastId:' + socket.lastId);
      }
      db.readMessage(socket[config.pk], socket.lastId, function(data) {
        if (data.length) {
          util.setLastId(socket, data);
          socket.emit('loadMessage', data);
        } else {
          socket.canLoad = false;
          socket.emit('loadMessage', []);
        }
      });
    } else {
      console.warn('no more message');
    }
  });

  /**
   * 绑定用户
   */
  socket.on('call', function(patient) {
    var nurseId = socket[config.pk];
    console.info('[Call]' + nurseId + '<=>' + patient.id);
    util.call(socket, patient);
  });

  /**
   * 转接
   */
  socket.on('callForwarding', function(patient, nurse) {
    var fromId = socket[config.pk];
    console.info('[Call Forwarding]' + patient.id + ':' + fromId + '->' + nurse.id);
    util.callForwarding(socket, patient, nurse);
  });

});
