// var patient = {
//   id: Number,
//   username: String,
//   role: Number,
//   binding: Number
// };

// var nurse = {
//   id: Number,
//   username: String,
//   role: Number,
//   binding: Array
// };

// key为客户端的字段名
// value为服务端的字段名
var user = {
  id: config.pk,
  username: 'username',
  type: 'role',
  binding: {
    id: 'id',
    username: 'username'
  }
};

module.exports = {
  user: user
};
