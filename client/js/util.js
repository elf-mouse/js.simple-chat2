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

// 当前状态
socket.on('status', function(current_user, users) {
  console.log('[Status]当前用户:' + current_user);
  console.log('[Status]在线人数:' + users.length);
  console.log(users);
});

document.getElementById('status').addEventListener('click', function() {
  socket.emit('status');
}, false);

// 显示图片
function showImage(sender, imgData) {
  var container = document.getElementById('history-message'),
    msgToDisplay = document.createElement('p'),
    date = new Date().toTimeString().substr(0, 8);

  msgToDisplay.innerHTML = sender + '<span class="timespan">(' + date + '): </span><br>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"></a>';
  container.appendChild(msgToDisplay);
  container.scrollTop = container.scrollHeight;
}

// 清空聊天输入框
function clearMessage() {
  document.getElementById('message').value = '';
}

// 聊天初始化
function initMessage() {
  window.historyMessageObj.scrollTop = window.originHeight;
  window.historyMessageObj.style.visibility = 'visible';
}

// 加载历史聊天记录
function loadMessage(data) {
  console.log(data);

  var tpl = `<p class="time">时间 xxxx-xx-xx</p><div class="receiver"><img src="http://tse3.mm.bing.net/th?id=OIP.Mc8c03e62f78cbcad0969763649b6f50fo0&w=146&h=147&c=7&rs=1&qlt=90&o=4&pid=1.1" alt="">aaa</div>
<div class="sender">bbb<img src="http://tse2.mm.bing.net/th?id=OIP.M0ab2cc8b85c5cb4e16ebdec3109afb49o0&w=147&h=147&c=7&rs=1&qlt=90&o=4&pid=1.1" alt=""></div>
<div class="receiver"><img src="http://tse3.mm.bing.net/th?id=OIP.Mc8c03e62f78cbcad0969763649b6f50fo0&w=146&h=147&c=7&rs=1&qlt=90&o=4&pid=1.1" alt="">ccc</div>
<div class="sender">ddd<img src="http://tse2.mm.bing.net/th?id=OIP.M0ab2cc8b85c5cb4e16ebdec3109afb49o0&w=147&h=147&c=7&rs=1&qlt=90&o=4&pid=1.1" alt=""></div>
<div class="receiver"><img src="http://tse3.mm.bing.net/th?id=OIP.Mc8c03e62f78cbcad0969763649b6f50fo0&w=146&h=147&c=7&rs=1&qlt=90&o=4&pid=1.1" alt="">eee</div>
<div class="sender">fff<img src="http://tse2.mm.bing.net/th?id=OIP.M0ab2cc8b85c5cb4e16ebdec3109afb49o0&w=147&h=147&c=7&rs=1&qlt=90&o=4&pid=1.1" alt=""></div>
<div class="receiver"><img src="http://tse3.mm.bing.net/th?id=OIP.Mc8c03e62f78cbcad0969763649b6f50fo0&w=146&h=147&c=7&rs=1&qlt=90&o=4&pid=1.1" alt="">gggg</div>
<div class="sender">hhh<img src="http://tse2.mm.bing.net/th?id=OIP.M0ab2cc8b85c5cb4e16ebdec3109afb49o0&w=147&h=147&c=7&rs=1&qlt=90&o=4&pid=1.1" alt=""></div>
`;

  var output = createHTML(tpl);
  window.historyMessageObj.insertBefore(output, window.historyMessageObj.firstChild);
  window.historyMessageObj.scrollTop += (window.historyMessageObj.scrollHeight - window.originHeight);
  window.originHeight = window.historyMessageObj.scrollHeight;
}

// 显示聊天
function showMessage(sender, msg) {
  var container = document.getElementById('history-message'),
    msgToDisplay = document.createElement('p'),
    date = new Date().toTimeString().substr(0, 8),
    msg = showEmoji(msg); // determine whether the msg contains emoji

  msgToDisplay.innerHTML = sender + '<span class="timespan">(' + date + '): </span>' + msg;
  container.appendChild(msgToDisplay);
  container.scrollTop = container.scrollHeight;
}

// 显示表情
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

// 创建历史聊天记录模板
function createHTML(htmlStr) {
  var frag = document.createDocumentFragment(),
    temp = document.createElement('div');
  temp.innerHTML = htmlStr;
  while (temp.firstChild) {
    frag.appendChild(temp.firstChild);
  }
  return frag;
}

export {
  socket,
  showMessage,
  clearMessage,
  initMessage,
  loadMessage,
  showImage,
  showEmoji,
  getUserInfo,
  createHTML
};
