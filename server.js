global.config = require('./server/config');
global.db = require('./server/db/chat');
global.util = require('./server/util');
global.io = require('socket.io')(config.server.port);
global.userIds = []; // 用户ID列表
global.users = {}; // 用户数据 { userId: object }
global.conns = {}; // 连接集合 { userId: socketId }

var event = require('./server/event/index');

io.on('connection', function(socket) {
  console.info('[Connection]Connection ' + socket.id + ' accepted.');

  /**
   * [获取当前状态]
   */
  socket.on('status', function() {
    console.log('[Status]' + socket.id);
    event.getStatus(socket);
  });

  /************************** 通用事件 *******************************/

  /**
   * [登录]
   * @param  {[object]} user) [用户信息]
   */
  socket.on('login', function(user) {
    event.login(socket, user);
  });

  /**
   * [离线]
   */
  socket.on('disconnect', function() {
    console.info('[Disconnect]Connection ' + socket.id + ' terminated.');
    event.disconnect(socket);
  });

  /**
   * [发消息]
   * @param  {[int]} receiverId [对方ID]
   * @param  {[string]} message [消息内容]
   */
  socket.on('message', function(receiverId, message) {
    event.sendMessage(socket, config.chats[config.chatType.message], receiverId, message);
  });

  /**
   * [发图片]
   * @param  {[int]} receiverId [对方ID]
   * @param  {[string]} imgData [图片数据]
   */
  socket.on('image', function(receiverId, imgData) {
    event.sendMessage(socket, config.chats[config.chatType.image], receiverId, imgData);
  });

  /**
   * [加载更多消息]
   */
  socket.on('loadMessage', function() {
    event.loadMessage(socket);
  });

  /************************** 后台专用事件 *******************************/

  /**
   * [绑定用户]
   * @param  {[object]} patient [患者信息]
   */
  socket.on('call', function(patient) {
    event.call(socket, patient);
  });

  /**
   * [转接]
   * @param  {[object]} patient [患者信息]
   * @param  {[object]} nurse   [秘书信息]
   */
  socket.on('callForwarding', function(patient, nurse) {
    event.callForwarding(socket, patient, nurse);
  });

});
