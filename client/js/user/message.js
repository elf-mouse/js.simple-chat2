import { ROLE_TYPE as roleType } from '../config';
import { socket, showMessage, clearMessage, loadMessage } from '../util';
import Hammer from 'hammerjs';

function sendMessage(socket, sender, receiver, message) {
  socket.emit('message', receiver, message);
  showMessage(sender.username, message);
  clearMessage();
}

// 发送消息
document.getElementById('send').addEventListener('click', function() {
  if (!window.user) {
    alert('未登录');
    return false;
  }

  var sender = window.user;
  var receiver = sender.binding ? sender.binding.nurseName : null;
  var message = document.getElementById('message').value;

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

// 接收历史消息
socket.on('loadMessage', function(data) {
  console.log('成功接收历史消息');
  loadMessage(data);
});

// 加载消息
var hammertime = new Hammer(window.historyMessageObj);
hammertime.on('pan', function() {
  if (window.historyMessageObj.scrollTop < 88) {
    console.log('loading');
    socket.emit('loadMessage');
  }
});
