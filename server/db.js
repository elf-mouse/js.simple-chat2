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
      console.log(err);
    } else {
      console.log('chat saved');
    }
  });
}

function readMessage(username) {
  console.log(username);
}

module.exports.writeMessage = writeMessage;
module.exports.readMessage = readMessage;
