import { CONFIG } from '../config';
import data from '../data'; // 假数据

// 清空聊天输入框
function clearMessage() {
  document.getElementById('message').value = '';
}

// 创建聊天模板
function createMessageTpl(senderId, content, time = '') {
  var userId = window.user.id; // 当前用户
  var className = senderId == userId ? 'sender' : 'receiver';

  var tpl = `<div class="${className}">senderId: ${senderId}<p>${content}</p></div>`;

  return tpl;
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

// 显示聊天
function showMessage(senderId, msg) {
  var container = document.getElementById('history-message'),
    msgToDisplay = document.createElement('p'),
    date = new Date().toTimeString().substr(0, 8),
    msg = showEmoji(msg); // determine whether the msg contains emoji

  msgToDisplay.innerHTML = createMessageTpl(senderId, msg);
  container.appendChild(msgToDisplay);
  container.scrollTop = container.scrollHeight;
}

// 发送消息
function sendMessage(socket, sender, receiverId, message) {
  socket.emit('message', receiverId, message);
  showMessage(sender.id, message);
  clearMessage();
}

// 聊天初始化
function initMessage() {
  window.historyMessageObj.scrollTop = window.originHeight;
  window.historyMessageObj.style.visibility = 'visible';
}

// 加载历史聊天记录
function loadMessage(data) {
  if (!data.length) {
    window.hasMessage = false;
    console.log('没有更多消息');
  }

  if (window.hasMessage) {
    console.log(data);

    var tpl = '<p class="time">时间 xxxx-xx-xx</p>';

    for (var i = data.length - 1; i >= 0; i--) {
      var msg = data[i];
      var content = (msg.chatType == 1) ? msg.content : showEmoji(msg.content); // 图片未处理
      tpl += createMessageTpl(msg.senderId, content);
    }

    var output = createHTML(tpl);
    window.historyMessageObj.insertBefore(output, window.historyMessageObj.firstChild);
    window.historyMessageObj.scrollTop += (window.historyMessageObj.scrollHeight - window.originHeight);
    window.originHeight = window.historyMessageObj.scrollHeight;
  }
}

// 显示图片
function showImage(senderId, imgData) {
  var container = document.getElementById('history-message'),
    msgToDisplay = document.createElement('p'),
    date = new Date().toTimeString().substr(0, 8);

  msgToDisplay.innerHTML = createMessageTpl(senderId, '<img src="' + imgData + '">');
  container.appendChild(msgToDisplay);
  container.scrollTop = container.scrollHeight;
}

// 模拟获取用户信息
function getUserInfo(userId, role) {
  var userInfo = {};
  var list = role === 1 ? data.patient : data.nurse;

  for (var user of list) {
    if (user.id == userId) {
      userInfo = user;
    }
  }
  userInfo.type = role;

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

function initEmoji() {
  var emojiContainer = document.getElementById('emoji-wrapper');
  var docFragment = document.createDocumentFragment();

  for (var i = 69; i > 0; i--) {
    var emojiItem = document.createElement('img');
    emojiItem.src = '../img/emoji/' + i + '.gif';
    emojiItem.title = i;
    docFragment.appendChild(emojiItem);
  }
  emojiContainer.appendChild(docFragment);
}

initEmoji();

export {
  clearMessage,
  sendMessage,
  initMessage,
  loadMessage,
  showMessage,
  showEmoji,
  showImage,
  getUserInfo,
  createHTML
};
