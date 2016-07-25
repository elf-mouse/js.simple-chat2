var DEBUG = true;

var CHAT_SERVER = {
  port: 8080
};

var IMAGE_SERVER = {
  host: ''
};

var AUTH = {
  close: false, // 无需认证 仅开发测试用
  delay: 3000, // 检查认证3秒内无响应将自动断线
  expiry: { // 随机检查认证时间范围（单位：分）
    min: 10,
    max: 30
  }
};

var MONGO = {
  user: '',
  pass: '',
  host: 'localhost',
  port: 27017,
  name: 'test',
  messageCount: 20, // 每次读取消息条数
  autoreplyId: 1 // WEB后台配置固定ID为1
};

var REDIS = {
  user: '',
  password: '',
  host: '127.0.0.1',
  port: 6379
};

MONGO.auth = (MONGO.user && MONGO.pass) ? (MONGO.user + ':' + MONGO.pass + '@') : '';
REDIS.options = {}; // TODO

var PRIMARY_KEY = 'uid';

var CHAT_TYPE = {
  message: 0, // 文字
  image: 1 // 图片
};
var CHATS = ['message', 'image'];

// 注：用户角色ID跟着MySQL设定走（从1开始）
var ROLE_TYPE = {
  patient: 1,
  nurse: 2
};
var ROLES = ['zero', 'patient', 'nurse']; // zero暂时无效

var UPLOAD = {
  basePath: '/uploads/',
  uploadPath: __dirname + '/../uploads/'
};

// 系统消息类型
var SYSTEM = {
  login: {
    disallow: 0,
  },
  auth: {
    invalid: 1,
    failure: 2,
    expiry: 3
  },
  message: {
    empty: 4
  }
};

var WEEK = {
  0: '日',
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六'
};

module.exports.debug = DEBUG;
module.exports.chatServer = CHAT_SERVER;
module.exports.imageServer = IMAGE_SERVER;
module.exports.auth = AUTH;
module.exports.mongo = MONGO;
module.exports.redis = REDIS;
module.exports.pk = PRIMARY_KEY;
module.exports.chatType = CHAT_TYPE;
module.exports.chats = CHATS;
module.exports.roleType = ROLE_TYPE;
module.exports.roles = ROLES;
module.exports.upload = UPLOAD;
module.exports.system = SYSTEM;
module.exports.week = WEEK;
