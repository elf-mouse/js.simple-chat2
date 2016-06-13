import socket from '../common/socket';
import { sendMessage } from '../common/util';

// 发送消息
document.getElementById('send').addEventListener('click', function() {
  if (!window.user) {
    alert('未登录');
    return false;
  }

  var sender = window.user;
  var receiver = window.receiver;
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
