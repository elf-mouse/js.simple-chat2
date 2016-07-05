function clean(socket) {
  console.info('[Clean]================');

  var userId = socket[config.pk];
  for (var key in userIds) {
    if (userIds[key] === userId) {
      userIds.splice(key, 1);
      break;
    }
  }
  delete users[userId];
  delete conns[userId];
  socket.leave(socket.room);

  if (config.debug) {
    console.info('userIds');
    console.log(userIds);
    console.info('users');
    console.log(users);
    console.info('conns');
    console.log(conns);
  }
}

module.exports = function(socket) {
  clean(socket);

  if (socket.role === config.roleType.patient) {
    util.updateOnlineUser(socket, false); // offline
  }
};
