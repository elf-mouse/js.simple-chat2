var DEBUG = true;

var SERVER = {
  port: 3000
};

var DB = {
  user: '',
  pass: '',
  host: 'localhost',
  port: 27017,
  name: 'test'
};

var CHAT_TYPE = {
  message: 0, // 文字
  image: 1 // 图片
};

var ROLE_TYPE = {
  patient: 0,
  doctor: 1,
  nurse: 2
};

var ROOMS = ['patient', 'doctor', 'nurse']; // by ROLE_TYPE

DB.auth = (DB.user && DB.pass) ? (DB.user + ':' + DB.pass + '@') : '';

module.exports.debug = DEBUG;
module.exports.server = SERVER;
module.exports.db = DB;
module.exports.chatType = CHAT_TYPE;
module.exports.roleType = ROLE_TYPE;
module.exports.rooms = ROOMS;
