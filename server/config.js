var MODEL = require('./model');
// var PRIMARY_KEY = 'username';

var DEBUG = true;

var SERVER = {
  port: 3000
};

var DB = {
  user: '',
  pass: '',
  host: 'localhost',
  port: 27017,
  name: 'test',
  // 查询聊天记录
  options: {
    select: 'sender receiver type content created',
    sort: { created: -1 },
    limit: 10
  }
};

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


DB.auth = (DB.user && DB.pass) ? (DB.user + ':' + DB.pass + '@') : '';


module.exports.debug = DEBUG;
module.exports.server = SERVER;
module.exports.db = DB;
module.exports.chatType = CHAT_TYPE;
module.exports.chats = CHATS;
module.exports.roleType = ROLE_TYPE;
module.exports.roles = ROLES;
module.exports.model = MODEL;
// module.exports.pk = PRIMARY_KEY;
