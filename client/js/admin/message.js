import { ROLE_TYPE as roleType } from '../config';
import { socket, showMessage, clearMessage } from '../util';

function sendMessage(socket, sender, receiver, message) {
  socket.emit('message', receiver, message);
  showMessage(sender.username, message);
  clearMessage();
}

document.getElementById('send').addEventListener('click', function() {
  if (!global.user) {
    alert('未登录');
    return false;
  }

  var sender = global.user;
  var receiver = global.receiver;
  var message = document.getElementById('message').value;

  if (!receiver) {
    alert('请选择一个聊天对象');
    return false;
  }

  if (message.trim() === '') {
    console.log('消息不能为空');
  } else {
    sendMessage(socket, sender, receiver, message);
  }
}, false);

// 接收消息
socket.on('message', function(sender, msg) {
  console.log('成功接收消息');
  showMessage(sender, msg);
});
