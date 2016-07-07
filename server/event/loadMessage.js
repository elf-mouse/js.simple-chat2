module.exports = function(socket, patientId) {
  if (socket.canLoad) {
    if (config.debug) {
      console.info('loadMessage');
      console.log('username:' + socket.username + ',lastId:' + socket.lastId);
    }

    if (socket.role === config.roleType.nurse && !patientId) {
      console.warn('Missing parameters');
    } else {
      db.getPatientMessage(patientId || socket[config.pk], socket.lastId, function(data) {
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
    }
  } else {
    console.warn('No more message');
  }
};
