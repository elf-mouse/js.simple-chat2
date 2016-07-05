module.exports = function(socket) {
  if (socket.canLoad) {
    if (config.debug) {
      console.info('loadMessage');
      console.log('username:' + socket.username + ',lastId:' + socket.lastId);
    }
    db.readMessage(socket[config.pk], socket.lastId, function(data) {
      if (data.length) {
        util.setLastId(socket, data);
        // response
        socket.emit('loadMessage', data);
      } else {
        socket.canLoad = false;
        // response
        socket.emit('loadMessage', []);
      }
    });
  } else {
    console.warn('no more message');
  }
};
