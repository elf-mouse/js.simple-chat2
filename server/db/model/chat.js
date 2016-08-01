var mongoose = require('../conn');

var chat = {
  sender_id: Number,
  receiver_id: {
    type: Number,
    default: 0,
    index: true
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
chatSchema.index({ sender_id: 1, receiver_id: 1 });
chatSchema.index({ sender_id: 1, receiver_id: 1, created_at: 1 }); // for php
var Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
