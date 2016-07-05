module.exports = function(socket, patient) {
  var nurseId = socket[config.pk];
  var patientId = patient.id;
  console.info('[Call]' + nurseId + '<=>' + patientId);

  socket.currentBindingId = patientId; // 当前聊天对象ID
  util.updateUnread(socket, patientId, true); // 未读消息置0

  var binding = {
    nurse: {
      id: socket[config.pk],
      username: socket.username
    },
    patient: {
      id: patientId,
      username: patient.username
    }
  };

  util.updateUserBinding(socket, {
    userId: binding.nurse.id,
    binding: binding.patient,
    isNurse: true
  });

  if (config.debug) {
    console.info('nurse binding');
    console.log(socket.binding);
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
      console.info('patient binding');
      console.log(toSocket.binding);
    }
  }

  offlineMessage[binding.patient.id] = 0; // 重置离线未读消息数
  db.updateOfflineMessage(binding.patient.id, binding.nurse.id);
};
