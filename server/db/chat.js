var mongoose = require('./conn');
var table = require('./table');

var chatSchema = mongoose.Schema(table.chat);
var Chat = mongoose.model('Chat', chatSchema);

function writeMessage(data) {
  var chat = new Chat(data);
  console.log('before save chat', chat);

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
    select: 'sender receiver type content created',
    sort: { created: -1 },
    limit: config.db.messageCount
  };
  var query = Chat.find({ $or: [{ sender: userId }, { receiver: userId }] });

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
            sender: item.sender,
            receiver: item.receiver,
            type: item.type,
            content: item.content,
            created: new Date(item.created).getTime() // 转时间戳
          };
          result.push(value);
        }
        callback(result);
      }
    });
}

function updateOfflineMessage(patientId, nurseId) {
  var conditions = { $and: [{ sender: patientId }, { receiver: 0 }] };
  var update = { $set: { receiver: nurseId } };
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
