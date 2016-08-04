module.exports = function(socket, patients, nurse) {
  var fromId = socket[config.pk];
  var binding = {
    fromNurse: {
      id: socket[config.pk],
      name: socket.username
    },
    toNurse: {
      id: nurse.id,
      name: nurse.name
    }
  };
  var patientIds = []; // 用于转接通知
  var nurseSocketId = conns[binding.toNurse.id];

  patients.map(function(patient) {
    console.info(util.now() + '[Call Forwarding]' + patient.id + ' : ' + fromId + '->' + nurse.id);
    patientIds.push(patient.id);

    binding.patient = {
      id: patient.id,
      name: patient.name
    };

    util.updateUserBinding(socket, {
      userId: binding.fromNurse.id,
      binding: binding.patient,
      isNurse: true
    }, true);

    if (config.debug) {
      console.log('from nurse binding', socket.binding);
    }

    DB.store.delete(binding.fromNurse.id, binding.patient.id); // 转接口删除未读消息统计

    var patientSocketId = conns[binding.patient.id];
    if (patientSocketId) {
      util.updateUserBinding(io.sockets.connected[patientSocketId], {
        userId: binding.patient.id,
        binding: binding.toNurse,
        isNurse: false
      });

      if (config.debug) {
        console.log('patient binding', io.sockets.connected[patientSocketId].binding);
      }
    }

    if (nurseSocketId) {
      util.updateUserBinding(io.sockets.connected[nurseSocketId], {
        userId: binding.toNurse.id,
        binding: binding.patient,
        isNurse: true
      });

      if (config.debug) {
        console.log('to nurse binding', io.sockets.connected[nurseSocketId].binding);
      }
    }
  });

  if (nurseSocketId) {
    // response: 转接通知
    io.sockets.connected[nurseSocketId].emit('callForwarding', {
      nurse: binding.fromNurse,
      patientIds: patientIds
    });
  }
};
