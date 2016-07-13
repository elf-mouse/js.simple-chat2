/**
 * 读消息
 */
function readMessage(query, all, callback) {
  var options = {
    select: 'sender_id receiver_id chat_type content created_at',
    sort: { created_at: -1 }
  };

  if (!all) {
    options.limit = config.db.messageCount;
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

module.exports.readMessage = readMessage;
