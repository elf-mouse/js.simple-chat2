module.exports = function(socket, patient, nurse) {
  var fromId = socket[config.pk];
  console.info(util.now() + '[Call Forwarding]' + patient.id + ':' + fromId + '->' + nurse.id);

  var binding = {
    fromNurse: {
      id: socket[config.pk],
      name: socket.username
    },
    patient: {
      id: patient.id,
      name: patient.name
    },
    toNurse: {
      id: nurse.id,
      name: nurse.name
    }
  };

  util.updateUserBinding(socket, {
    userId: binding.fromNurse.id,
    binding: binding.patient,
    isNurse: true
  }, true);

  if (config.debug) {
    console.info('from nurse binding');
    console.log(socket.binding);
  }

  var patientSocketId = conns[binding.patient.id];
  if (patientSocketId) {
    util.updateUserBinding(io.sockets.connected[patientSocketId], {
      userId: binding.patient.id,
      binding: binding.toNurse,
      isNurse: false
    });

    if (config.debug) {
      console.info('patient binding');
      console.log(io.sockets.connected[patientSocketId].binding);
    }
  }

  var nurseSocketId = conns[binding.toNurse.id];
  if (nurseSocketId) {
    util.updateUserBinding(io.sockets.connected[nurseSocketId], {
      userId: binding.toNurse.id,
      binding: binding.patient,
      isNurse: true
    });
    // response: 转接通知
    io.sockets.connected[nurseSocketId].emit('callForwarding', {
      nurse: binding.fromNurse,
      patient: binding.patient
    });

    if (config.debug) {
      console.info('to nurse binding');
      console.log(io.sockets.connected[nurseSocketId].binding);
    }
  }
};
