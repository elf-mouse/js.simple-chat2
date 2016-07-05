var model = require('../model');

var chatType = config.chatType;
var roleType = config.roleType;
var userModel = model.user;

function getReceiverById(senderId, receiverId) {
  var username = '';

  if (receiverId) {
    console.info('getReceiverById:' + senderId + '->' + receiverId);

    for (var key in users) {
      var user = users[key];
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

/**
 * [发消息]
 * @param  {[object]} socket
 * @param  {[int]} type       [消息类型]
 * @param  {[int]} receiverId [对方ID]
 * @param  {[string]} data    [消息]
 */
module.exports = function(socket, type, receiverId, data) {
  console.info('sendMessage');

  var senderId = socket[config.pk];
  var sender = socket.username;

  if (senderId) { // sender已登录
    var socketId;
    var receiver = getReceiverById(senderId, receiverId);
    var unread = 0;

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
      if (socket.role === roleType.patient && receiver) { // 患者 -> 秘书 => nurse.unread[patientId]++
        unread = util.updateUnread(io.sockets.connected[socketId], senderId);
      } else { // 秘书 -> 患者 => nurse.unread[patientId] = 0
        unread = util.updateUnread(socket, receiverId, true);
      }
      // response
      io.sockets.connected[socketId].emit(type, {
        senderId: senderId,
        message: data,
        unread: unread
      });
    } else { // receiver离线
      console.log('user is offline');

      if (socket.role === roleType.patient) { // 群发
        // response
        socket.to(config.roles[roleType.nurse]).emit(type, {
          senderId: senderId,
          message: data,
          unread: 0
        });
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
};
