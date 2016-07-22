global.config = require('./config');
global.DB = {
  model: require('./db/model/index'),
  query: require('./db/query'),
  store: require('./db/store')
};
global.util = require('./util');
global.io = require('socket.io')(config.server.port);
global.userIds = []; // 用户ID列表
global.users = {}; // 用户数据 { userId: object }
global.conns = {}; // 连接集合 { userId: socketId }
global.offlineMessage = {}; // 患者离线消息统计 { patientId: count }
