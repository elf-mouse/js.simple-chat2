import { socket, showMessage, clearMessage } from './util';

document.getElementById('send').addEventListener('click', function() {
  var username = document.getElementById('user-a').value;
  var someone = document.getElementById('user-b').value;
  var message = document.getElementById('message').value;
  if (message.trim() === '') {
    alert('消息不能为空');
  } else {
    socket.emit('message', someone, message);
    showMessage(username, message);
    clearMessage();
  }
}, false);

// 接收消息
socket.on('message', function(user, msg) {
  console.log('成功接收消息');
  showMessage(user, msg);
});
