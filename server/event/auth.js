var md5 = require('md5');
var disconnect = require('./disconnect');

function checkAuth(socket, token) {
  var result = false;

  // base64 decode
  var decodeToken = new Buffer(token, 'base64').toString();
  // md5 & uid & time
  var md5Str = decodeToken.substr(0, 21);
  var uid = decodeToken.substr(21, decodeToken.substr(21).length - 10);
  var time = decodeToken.substr(-10);
  // to string
  var msgStr = '' + uid + time.substr(5);

  if (md5(msgStr).substr(10, 21) === md5Str) {
    // 认证成功
    console.info('auth success');
    result = true;
    // 下一次认证
    var currentTime = new Date().getTime();
    var authExpiry = (Math.floor(Math.random() * (config.auth.expiry.max - config.auth.expiry.min + 1)) + config.auth.expiry.min) * 1000 * 60;

    console.log('authExpiry:' + authExpiry);

    if (socket.authTimeoutId) {
      clearTimeout(socket.authTimeoutId);
    }
    socket.auth = true;
    socket.authExpiry = currentTime + authExpiry + config.auth.delay;
    socket.authTimeoutId = setTimeout(function() {
      console.log(socket.id + ' check auth again');
      socket.auth = false;
      // response
      socket.emit('auth');
    }, authExpiry);
  } else {
    // 认证失败
    console.warn('auth failure');
    // response
    socket.emit('system', config.system.auth.failure);
    // 关闭连接
    disconnect(socket);
  }

  return result;
}

/**
 * 检查认证
 *
 * @param  {string} token [length > 32, md5($uid + time[5:10])[10:31] + $uid + time()]
 */
module.exports = function(socket, token, userId) {
  console.info(util.now() + 'Authentication');
  var result = false;

  if (token || false) {
    if (userId || false) { // 再次认证
      var decodeToken = new Buffer(token, 'base64').toString();
      var uid = decodeToken.substr(21, decodeToken.substr(21).length - 10);

      if (uid == socket[config.pk]) {
        result = checkAuth(socket, token);
      } else { // 无效用户ID
        console.warn('Invalid uid');
        // response
        socket.emit('system', config.system.auth.invalid);
        // 关闭连接
        disconnect(socket);
      }
    } else { // 首次认证
      result = checkAuth(socket, token);
    }
  } else { // 无效Token
    console.warn('Invalid token');
    // response
    socket.emit('system', config.system.auth.invalid);
    // 关闭连接
    disconnect(socket);
  }

  return result;
};
