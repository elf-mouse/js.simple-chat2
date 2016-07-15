// key为客户端（来源于MySQL）的字段名
// value为聊天服务端的字段名
var user = {
  id: config.pk,
  name: 'username',
  type: 'role',
  tag_id: 'tag_id', // 2016.07.07 新增 `分组ID`
  binding: {
    id: 'id',
    name: 'username'
  }
};

module.exports = {
  user: user
};
