import { ROLE_TYPE as roleType } from '../config';
import socket from '../common/socket';
import { getUserInfo, initMessage, loadMessage } from '../common/util';

var username = '';
var user;

// 测试（真实环境无需手动登录）
document.getElementById('login').addEventListener('click', function() {
  console.log('before connect');

  username = document.getElementById('users').value;
  user = getUserInfo(username, roleType.patient);

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
socket.on('loginSuccess', function(data) {
  console.log(username + ' loginSuccess');

  window.user = user;
  console.log(window.user);

  initMessage();
  loadMessage(data);
});
