module.exports = function(socket) {
  // response
  socket.emit('status', {
    currentUser: socket[config.pk] + ':' + socket.username,
    userIds: userIds,
    users: users
  });
};
