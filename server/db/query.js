/**
 * 写消息
 */
function writeMessage(data) {
  var chat = new DB.model('chat')(data);

  chat.save(function(err) {
    if (err) {
      console.error('[DB]' + err);
    } else {
      console.log('[DB]chat saved');
    }
  });
}

/**
 * 获取患者消息
 */
function getPatientMessage(patientId, lastId, callback) {
  var query = DB.model('chat').find({
    $or: [
      { sender_id: patientId },
      { receiver_id: patientId }
    ]
  });

  if (lastId || false) {
    query.where('_id').lt(lastId);
  }

  var options = {
    select: 'sender_id receiver_id chat_type content created_at',
    sort: { created_at: -1 }
  };

  options.limit = config.mongo.messageCount;

  query
    .limit(options.limit)
    .sort(options.sort)
    .select(options.select)
    .exec(function(err, data) {
      if (err) {
        console.error('[DB]' + err);
        callback([]);
      } else {
        var result = [];
        for (var item of data) {
          var value = {
            id: item._id,
            senderId: item.sender_id,
            receiverId: item.receiver_id,
            chatType: item.chat_type,
            content: item.content, // TODO: 图片路径未处理
            created: new Date(item.created_at).getTime() // 转时间戳
          };
          result.push(value);
        }
        callback(result);
      }
    });
}

/**
 * 获取全部离线消息
 */
function getOfflineMessageCount(callback) {
  var options = [{
    $match: { receiver_id: 0 }
  }, {
    $group: {
      _id: "$sender_id",
      message_count: { $sum: 1 }
    }
  }];

  DB.model('chat').aggregate(options, function(err, data) {
    if (err) {
      console.error('[DB]' + err);
    }
    var result = [];
    for (var item of data) {
      var value = {
        id: item._id,
        unread: item.message_count
      };
      result.push(value);
    }
    callback(result);
  });
}

/**
 * 更新离线消息关系链
 */
function updateOfflineMessage(patientId, nurseId) {
  var conditions = { $and: [{ sender_id: patientId }, { receiver_id: 0 }] };
  var update = { $set: { receiver_id: nurseId } };
  var options = { multi: true };

  DB.model('chat').where(conditions)
    .setOptions(options)
    .update(update, function(err) {
      if (err) {
        console.error('[DB]' + err);
      } else {
        console.log('[DB]chat updated');
      }
    });
}

/**
 * 获取自动回复配置信息
 */
function getAutoreply(callback) {
  DB.model('autoreply').findOne({ id: config.mongo.autoreplyId }).exec(function(err, data) {
    if (err) {
      console.error('[DB]' + err);
    }
    callback(data);
  });
}

module.exports.writeMessage = writeMessage;
module.exports.getPatientMessage = getPatientMessage;
module.exports.getOfflineMessageCount = getOfflineMessageCount;
module.exports.updateOfflineMessage = updateOfflineMessage;
module.exports.getAutoreply = getAutoreply;
