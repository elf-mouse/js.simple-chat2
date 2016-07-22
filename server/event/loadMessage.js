module.exports = function(socket, patientId) {
  // reset loadMessage
  if (socket.currentPatientId != patientId) {
    socket.currentPatientId = patientId;
    socket.canLoad = true;
    socket.lastId = 0;
  }

  if (socket.canLoad) {
    if (config.debug) {
      console.info('loadMessage');
      console.log('patientId:' + patientId + ',lastId:' + socket.lastId);
    }

    if (socket.role === config.roleType.nurse && !patientId) {
      console.warn('Missing parameters');
    } else {
      DB.query.getPatientMessage(patientId || socket[config.pk], socket.lastId, function(data) {
        if (data.length) {
          socket.canLoad = true;
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
    // response
    socket.emit('loadMessage', []);
  }
};
