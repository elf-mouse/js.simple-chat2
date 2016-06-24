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

var user = {
  id: config.pk,
  username: 'username',
  role: 'role',
  binding: {
    id: 'id',
    username: 'username'
  }
};

module.exports = {
  user: user
};
