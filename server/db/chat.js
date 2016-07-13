var mongoose = require('./conn');
var table = require('./table');
var common = require('./common');

var chatSchema = mongoose.Schema(table.chat);
var Chat = mongoose.model('Chat', chatSchema);

/**
 * 写消息
 */
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

/**
 * 获取患者消息
 */
function getPatientMessage(patientId, lastId, callback) {
  var query = Chat.find({ $or: [{ sender_id: patientId }, { receiver_id: patientId }] });

  if (lastId || false) {
    query.where('_id').lt(lastId);
  }

  common.readMessage(query, false, callback);
}

/**
 * 获取全部离线消息
 */
function getAllOfflineMessage(callback) {
  var query = Chat.where({ receiver_id: 0 });

  common.readMessage(query, true, callback);
}

/**
 * 更新离线消息关系链
 */
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
module.exports.getPatientMessage = getPatientMessage;
// module.exports.getNurseMessage = getNurseMessage;
module.exports.getAllOfflineMessage = getAllOfflineMessage;
module.exports.updateOfflineMessage = updateOfflineMessage;
