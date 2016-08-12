module.exports = function(socket, patient) {
  var nurseId = socket[config.pk];
  var patientId = patient.id;

  console.info(util.now() + '[Call]' + nurseId + '<=>' + patientId);

  var binding = {
    nurse: {
      id: socket[config.pk],
      name: socket.username
    },
    patient: {
      id: patientId,
      name: patient.name
    }
  };

  util.updateUserBinding(socket, {
    userId: binding.nurse.id,
    binding: binding.patient,
    isNurse: true
  });

  if (config.debug) {
    console.log('nurse binding', socket.binding);
  }

  var patientSocketId = conns[binding.patient.id];
  if (patientSocketId) {
    var toSocket = io.sockets.connected[patientSocketId];
    util.updateUserBinding(toSocket, {
      userId: binding.patient.id,
      binding: binding.nurse,
      isNurse: false
    });

    if (config.debug) {
      console.log('patient binding', toSocket.binding);
    }
  }

  DB.store.delete(0, binding.patient.id); // 重置离线未读消息数
  DB.query.updateOfflineMessage(binding.patient.id, binding.nurse.id, function() {
    // response
    socket.to(config.roles[config.roleType.nurse]).emit('call', {
      nurseId: binding.nurse.id,
      patientId: binding.patient.id
    });
  });
};
