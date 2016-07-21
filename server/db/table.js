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

// 2016.07.21 新增自动回复表
var autoreply = {
  id: {
    type: Number,
    default: 0 // WEB后台配置固定ID为1
  },
  enabled: {
    type: Boolean,
    default: true
  },
  start_week: {
    type: Number,
    default: 0
  },
  end_week: {
    type: Number,
    default: 0
  },
  start_time: String,
  end_time: String,
  content: String // 使用时需替换占位符[workhours]
};

module.exports.chat = chat;
module.exports.autoreply = autoreply;
