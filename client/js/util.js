import { SERVER, CONFIG } from './config';
import data from './data';

var url = 'ws://' + SERVER.host + ':' + SERVER.port;
var socket = io(url);

// 连接服务器
socket.on('connect', function() {
  console.log('connect...');
});

// 系统消息
socket.on('system', function(name, count, type) {
  console.log('[' + type + '] 当前用户 ' + name + ' 当前人数 ' + count);
});

socket.on('status', function(current_user, users) {
  console.log('[Status]当前用户:' + current_user);
  console.log('[Status]在线人数:' + users.length);
  console.log(users);
});

document.getElementById('status').addEventListener('click', function() {
  socket.emit('status');
}, false);

function showImage(sender, imgData) {
  var container = document.getElementById('history-message'),
    msgToDisplay = document.createElement('p'),
    date = new Date().toTimeString().substr(0, 8);

  msgToDisplay.innerHTML = sender + '<span class="timespan">(' + date + '): </span><br>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"></a>';
  container.appendChild(msgToDisplay);
  container.scrollTop = container.scrollHeight;
}

function clearMessage() {
  document.getElementById('message').value = '';
}

function loadMessage(data) {

}

function showMessage(sender, msg) {
  var container = document.getElementById('history-message'),
    msgToDisplay = document.createElement('p'),
    date = new Date().toTimeString().substr(0, 8),
    msg = showEmoji(msg); // determine whether the msg contains emoji

  msgToDisplay.innerHTML = sender + '<span class="timespan">(' + date + '): </span>' + msg;
  container.appendChild(msgToDisplay);
  container.scrollTop = container.scrollHeight;
}

function showEmoji(msg) {
  var result = msg;

  if (document.getElementById('emoji-wrapper')) {
    var match;
    var reg = /\[emoji:\d+\]/g;
    var emojiIndex;
    var totalEmojiNum = document.getElementById('emoji-wrapper').children.length;

    while (match = reg.exec(msg)) {
      emojiIndex = match[0].slice(7, -1);
      if (emojiIndex > totalEmojiNum) {
        result = result.replace(match[0], '[X]');
      } else { // TODO: fix this in chrome it will cause a new request for the image
        result = result.replace(match[0], '<img class="emoji" src="' + CONFIG.imgPath + '/emoji/' + emojiIndex + '.gif">');
      }
    }
  }

  return result;
}

// 模拟获取用户信息
function getUserInfo(username, role) {
  var userInfo = '';
  var list = role === 1 ? data.nurse : data.patient;

  for (var user of list) {
    if (user.username === username) {
      userInfo = user;
    }
  }
  userInfo.role = role;

  return userInfo;
}

export {
  socket,
  showMessage,
  clearMessage,
  loadMessage,
  showImage,
  showEmoji,
  getUserInfo
};
