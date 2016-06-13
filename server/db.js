var mongoose = require('mongoose');

var DB_URI = 'mongodb://' + config.db.auth + config.db.host + ':' + config.db.port + '/' + config.db.name;
mongoose.connect(DB_URI);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('DB connected');
});


var chatSchema = mongoose.Schema({
  sender: String,
  receiver: String,
  type: Number,
  content: String,
  created: {
    type: Date,
    default: Date.now
  }
});

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

function readMessage(username, lastId, callback) {
  var query = Chat.find({ '$or': [{ 'sender': username }, { 'receiver': username }] });

  if (lastId || false) {
    query.where('_id').lt(lastId);
  }

  query
    .limit(config.db.options.limit)
    .sort(config.db.options.sort)
    .select(config.db.options.select)
    .exec(function(err, data) {
      if (!err) {
        // console.log(data);
        callback(data);
      }
    });
}

module.exports.writeMessage = writeMessage;
module.exports.readMessage = readMessage;
