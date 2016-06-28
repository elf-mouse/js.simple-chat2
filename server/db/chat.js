var mongoose = require('./conn');
var table = require('./table');

var chatSchema = mongoose.Schema(table.chat);
var Chat = mongoose.model('Chat', chatSchema);

function writeMessage(data) {
  var chat = new Chat(data);

  chat.save(function(err) {
    if (err) {
      console.error('[DB]' + err);
    } else {
      console.log('[DB]chat saved');
    }
  });
}

function readMessage(userId, lastId, callback) {
  var options = {
    select: 'sender_id receiver_id chat_type content created_at',
    sort: { created_at: -1 },
    limit: config.db.messageCount
  };
  var query = Chat.find({ $or: [{ sender_id: userId }, { receiver_id: userId }] });

  if (lastId || false) {
    query.where('_id').lt(lastId);
  }

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
            content: item.content,
            created: new Date(item.created_at).getTime() // 转时间戳
          };
          result.push(value);
        }
        callback(result);
      }
    });
}

function updateOfflineMessage(patientId, nurseId) {
  var conditions = { $and: [{ sender_id: patientId }, { receiver_id: 0 }] };
  var update = { $set: { receiver_id: nurseId } };
  var options = { multi: true };

  Chat.where(conditions)
    .setOptions(options)
    .update(update, function(err) {
      if (err) {
        console.error('[DB]' + err);
      } else {
        console.log('[DB]chat updated');
      }
    });
}

module.exports.writeMessage = writeMessage;
module.exports.readMessage = readMessage;
module.exports.updateOfflineMessage = updateOfflineMessage;
