import { SERVER, CONFIG } from './config';

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

socket.on('status', function(users) {
  console.log('[Status]在线人数:' + users.length);
  console.log(users);
});

document.getElementById('status').addEventListener('click', function() {
  socket.emit('status');
}, false);

function showImage(user, imgData) {
  var container = document.getElementById('history-message'),
    msgToDisplay = document.createElement('p'),
    date = new Date().toTimeString().substr(0, 8);

  msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span><br>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"></a>';
  container.appendChild(msgToDisplay);
  container.scrollTop = container.scrollHeight;
}

function clearMessage() {
  document.getElementById('message').value = '';
}

function showMessage(user, msg) {
  var container = document.getElementById('history-message'),
    msgToDisplay = document.createElement('p'),
    date = new Date().toTimeString().substr(0, 8),
    msg = showEmoji(msg); // determine whether the msg contains emoji

  msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
  container.appendChild(msgToDisplay);
  container.scrollTop = container.scrollHeight;
}

function showEmoji(msg) {
  var match,
    result = msg,
    reg = /\[emoji:\d+\]/g,
    emojiIndex,
    totalEmojiNum = document.getElementById('emoji-wrapper').children.length;

  while (match = reg.exec(msg)) {
    emojiIndex = match[0].slice(7, -1);
    if (emojiIndex > totalEmojiNum) {
      result = result.replace(match[0], '[X]');
    } else { // TODO: fix this in chrome it will cause a new request for the image
      result = result.replace(match[0], '<img class="emoji" src="' + CONFIG.imgPath + '/emoji/' + emojiIndex + '.gif">');
    }
  }

  return result;
}

export {
  socket,
  showMessage,
  clearMessage,
  showImage,
  showEmoji
};
