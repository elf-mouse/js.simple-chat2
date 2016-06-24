var chat = {
  sender: Number,
  receiver: Number,
  type: {
    type: Number,
    default: config.chatType.message
  },
  content: String,
  created: {
    type: Date,
    default: Date.now
  }
};

module.exports.chat = chat;
