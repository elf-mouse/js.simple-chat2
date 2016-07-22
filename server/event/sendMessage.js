var chatType = config.chatType;
var roleType = config.roleType;

function getReceiverById(senderId, receiverId) {
  var username = '';

  if (receiverId) {
    console.info(util.now() + 'getReceiverById:' + senderId + '->' + receiverId);

    for (var key in users) {
      var user = users[key];
      if (user.id == receiverId) {
        username = user.name;
        break;
      }

      if (user.id == senderId) {
        switch (user.type) {
          case roleType.patient:
            if (user.binding.id == receiverId) {
              username = user.binding.name;
            }
            break;
          case roleType.nurse:
            for (var binding of user.binding) {
              if (binding.id == receiverId) {
                username = binding.name;
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
    DB.query.writeMessage(value); // insert db
    console.log('File saved successful!');
  });
}

/**
 * 发消息
 * @param  {object} socket
 * @param  {int} type       消息类型
 * @param  {int} receiverId 对方ID
 * @param  {string} data    消息
 */
module.exports = function(socket, type, receiverId, data) {
  console.info(util.now() + 'sendMessage');

  var senderId = socket[config.pk];
  var sender = socket.username;
  var senderRole = socket.role;
  var groupId = socket.tag_id;

  if (senderId) { // sender已登录
    var socketId;
    var canSave = true;

    switch (senderRole) {
      case roleType.patient:
        console.log('patient send a message');
        if (socket.binding && socket.binding.id) {
          socketId = conns[socket.binding.id];
          receiverId = socket.binding.id;
        } else {
          socketId = null;
          receiverId = 0;
        }
        break;
      case roleType.nurse:
        if (!receiverId) {
          canSave = false;
          console.error('[ERROR]no receiver be found');
        }
        console.log('nurse send a message');
        socketId = conns[receiverId] || null;
        break;
    }

    var receiver = getReceiverById(senderId, receiverId);
    if (!receiver) {
      console.warn('[WARNING]receiver is offline');
    } else {

    }

    if (canSave) {
      if (socketId) { // receiver在线
        // 检查前后台角色的正确性 2016.07.22
        if (senderRole === io.sockets.connected[socketId].role) {
          console.error('[ERROR]role:' + senderRole);
        } else {
          if (senderRole === roleType.patient) { // 患者 -> 秘书 => nurse.unread[patientId]++
            console.log('msg: patient -> nurse');
            DB.store.get(receiverId, senderId, function(unread) {
              if (!unread) {
                store.add(receiverId, senderId);
                unread = 1;
              } else {
                store.update(receiverId, senderId);
                unread += 1;
              }
              // response
              io.sockets.connected[socketId].emit(type, {
                senderId: senderId,
                message: data,
                unread: unread
              });
            });
          } else { // 秘书 -> 患者 => nurse.unread[patientId] = 0
            console.log('msg: nurse -> patient');
            DB.store.delete(senderId, receiverId);
            // response
            io.sockets.connected[socketId].emit(type, {
              senderId: senderId,
              message: data,
              unread: 0
            });
          }
        }
      } else { // receiver离线
        console.log('user is offline');

        if (senderRole === roleType.patient) { // 群发
          offlineMessage[senderId] += 1; // 更新离线未读消息数
          console.log('OfflineMessage ' + senderId + ':' + offlineMessage[senderId]);
          // response
          socket.to(config.roles[roleType.nurse]).emit(type, {
            groupId: groupId,
            senderId: senderId,
            message: data,
            unread: offlineMessage[senderId]
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
          console.log(util.now() + '[SendImage]Received image: ' + senderId + ':' + sender + ' to ' + receiverId + ':' + receiver + ' a pic');
          value.chat_type = chatType.image;
          // 保持图片至本地
          saveFile(value, data);
          break;
        default: // message
          console.log(util.now() + '[SendMessage]Received message: ' + senderId + ':' + sender + ' to ' + receiverId + ':' + receiver + ' say ' + value.content);
          DB.query.writeMessage(value); // insert db
          break;
      }
    }
  } else {
    console.error('user is unlogin');
  }
};
