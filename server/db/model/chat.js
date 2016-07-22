var mongoose = require('../conn');

var chat = {
  sender_id: Number,
  receiver_id: {
    type: Number,
    default: 0
  },
  chat_type: {
    type: Number,
    default: config.chatType.message
  },
  content: String,
  created_at: {
    type: Date,
    default: Date.now
  }
};

var chatSchema = mongoose.Schema(chat);
var Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
