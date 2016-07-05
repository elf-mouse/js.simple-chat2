import socket from '../common/socket';
import { sendMessage } from '../common/util';

// 发送消息
document.getElementById('send').addEventListener('click', function() {
  if (!window.user) {
    alert('未登录');
    return false;
  }

  var sender = window.user;
  var receiverId = window.receiverId;
  var message = document.getElementById('message').value;

  if (!receiverId) {
    alert('请选择一个聊天对象');
    return false;
  }

  if (message.trim() === '') {
    console.log('消息不能为空');
  } else {
    sendMessage(socket, sender, receiverId, message);
  }
}, false);

// 加载消息
var lastKnownScrollPosition = 0;
var ticking = false;

window.historyMessageObj.addEventListener('scroll', function() {
  lastKnownScrollPosition = this.scrollTop;
  if (!ticking) {
    window.requestAnimationFrame(function() {
      if (lastKnownScrollPosition < 88) {
        console.log('loading');
        // 获取更多历史消息
        socket.emit('loadMessage');
      }
      if (window.hasMessage) {
        ticking = false;
      }
    });
  }
  ticking = true;
});
