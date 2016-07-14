var DEBUG = true;

var SERVER = {
  port: 8080
};

var AUTH = {
  delay: 3000, // 检查认证3秒内无响应将自动断线
  expiry: { // 随机检查认证时间范围（单位：分）
    min: 10,
    max: 30
  }
};

var DB = {
  user: '',
  pass: '',
  host: 'localhost',
  port: 27017,
  name: 'test',
  messageCount: 20 // 每次读取消息条数
};

DB.auth = (DB.user && DB.pass) ? (DB.user + ':' + DB.pass + '@') : '';

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

var UPLOAD_DIR = __dirname + '/../uploads/';

module.exports.debug = DEBUG;
module.exports.server = SERVER;
module.exports.auth = AUTH;
module.exports.db = DB;
module.exports.pk = PRIMARY_KEY;
module.exports.chatType = CHAT_TYPE;
module.exports.chats = CHATS;
module.exports.roleType = ROLE_TYPE;
module.exports.roles = ROLES;
module.exports.uploadDir = UPLOAD_DIR;
