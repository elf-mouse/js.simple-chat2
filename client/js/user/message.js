import socket from '../common/socket';
import { sendMessage } from '../common/util';
import Hammer from 'hammerjs';

// 发送消息
document.getElementById('send').addEventListener('click', function() {
  if (!window.user) {
    alert('未登录');
    return false;
  }

  var sender = window.user;
  var receiverId = sender.binding.id || null;
  var message = document.getElementById('message').value;

  if (message.trim() === '') {
    console.log('消息不能为空');
  } else {
    sendMessage(socket, sender, receiverId, message);
  }
}, false);

// 加载消息
var hammertime = new Hammer(window.historyMessageObj);
hammertime.on('pan', function() {
  if (window.hasMessage && window.historyMessageObj.scrollTop < 88) {
    console.log('loading');
    socket.emit('loadMessage');
  }
});
