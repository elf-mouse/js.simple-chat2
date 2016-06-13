import { ROLE_TYPE as roleType } from '../config';
import { socket, getUserInfo, initMessage, loadMessage } from '../util';

var username = '';
var user;

// 测试（真实环境无需手动登录）
document.getElementById('login').addEventListener('click', function() {
  console.log('before connect');

  username = document.getElementById('users').value;
  user = getUserInfo(username, roleType.nurse);

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

// 更新在线状态
socket.on('updateOnlineUser', function(user) {
  console.log(user);
});

// 获取在线状态
socket.on('getOnlineUser', function(users) {
  console.log(users);
});

// 选择聊天用户（绑定操作优先走DB检查）
[].forEach.call(document.querySelectorAll('.user'), function(el) {
  el.addEventListener('click', function() {
    // 检查是否可绑定
    // your request...

    // 绑定成功
    var receiver = this.innerHTML.trim();
    window.receiver = receiver;

    console.log('当前聊天对象' + receiver);
  }, false);
});
