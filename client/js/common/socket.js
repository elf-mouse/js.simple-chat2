import { SERVER } from '../config';
import { showMessage, loadMessage, showImage } from './util';

var url = 'ws://' + SERVER.host + ':' + SERVER.port;
var socket = io(url);

document.getElementById('status').addEventListener('click', function() {
  socket.emit('status');
}, false);

// 连接服务器
socket.on('connect', function() {
  console.log('connect...');
});

socket.on('auth', function() {
  console.log('check auth again');

  var token = 'NmIzZGY3NzE3OTNmMTA2OTlmZjRkNTE0NjgzOTk2NzE=';
  socket.emit('auth', token);
});

// 获取当前状态
socket.on('status', function(data) {
  console.log('[Status]当前用户:' + data.currentUser);
  console.log('[Status]在线人数:' + data.userIds.length);
  console.log(data.users);
  console.log(data.userIds);
});

/**
 * 接收消息
 *
 * data.senderId 发送者ID
 * data.message 消息内容
 * data.unread 未读消息
 */
socket.on('message', function(data) {
  console.log('成功接收消息');
  if (data.unread && document.getElementById('msg-' + data.senderId)) {
    document.getElementById('msg-' + data.senderId).innerHTML = data.unread;
  }
  showMessage(data.senderId, data.message);
});

/**
 * 接收历史消息
 * @param  {array} data 消息列表
 */
socket.on('loadMessage', function(data) {
  console.log('成功接收历史消息');
  loadMessage(data);
});

/**
 * 接收图片
 *
 * data.senderId 发送者ID
 * data.message 图片内容
 * data.unread 未读消息
 */
socket.on('image', function(data) {
  console.log('成功接收图片');
  if (data.unread && document.getElementById('msg-' + data.senderId)) {
    document.getElementById('msg-' + data.senderId).innerHTML = data.unread;
  }
  showImage(data.senderId, data.message);
});

/**
 * 转接通知
 *
 * data.nurse 秘书绑定信息
 * data.patinet 患者绑定信息
 */
socket.on('callForwarding', function(data) {
  console.log('护士' + data.nurse.username + '已将病人' + data.patient.username + '转入您名下');
});

export default socket;
