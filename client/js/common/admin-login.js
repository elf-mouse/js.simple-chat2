import { socket } from './util';

var username = '';
var role = '';

// 测试（真实环境无需手动登录）
document.getElementById('login').addEventListener('click', function() {
  console.log('before connect');

  username = document.getElementById('users').value;
  role = document.getElementById('role').value;

  var user = {
    username: username,
    role: role
  };

  socket.emit('login', user); // 真实环境应进入页面时自动触发
}, false);

// 断线
socket.on('disconnected', function() {
  console.log(username + ' is offline');
});

// 已登录
socket.on('userExisted', function() {
  console.log(username + ' userExisted');
});

// 登录成功
socket.on('loginSuccess', function() {
  console.log(username + ' loginSuccess');

  document.getElementById('users').disabled = true;
});

// 更新在线状态
socket.on('updateOnlineUser', function(user) {
  console.log(user);
});

// 获取在线状态
socket.on('getOnlineUser', function(users) {
  console.log(users);
});
