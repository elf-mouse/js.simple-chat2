var DEBUG = true;

var SERVER = {
  port: 8080
};

var DB = {
  user: '',
  pass: '',
  host: 'localhost',
  port: 27017,
  name: 'test',
  messageCount: 10 // 每次读取消息条数
};

DB.auth = (DB.user && DB.pass) ? (DB.user + ':' + DB.pass + '@') : '';

var PRIMARY_KEY = 'uid';

var CHAT_TYPE = {
  message: 0, // 文字
  image: 1 // 图片
};
var CHATS = ['message', 'image'];

var ROLE_TYPE = {
  patient: 0,
  nurse: 1
};
var ROLES = ['patient', 'nurse'];


module.exports.debug = DEBUG;
module.exports.server = SERVER;
module.exports.db = DB;
module.exports.pk = PRIMARY_KEY;
module.exports.chatType = CHAT_TYPE;
module.exports.chats = CHATS;
module.exports.roleType = ROLE_TYPE;
module.exports.roles = ROLES;
