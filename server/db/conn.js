var mongoose = require('mongoose');

var DB_URI = 'mongodb://' + config.db.auth + config.db.host + ':' + config.db.port + '/' + config.db.name;
mongoose.connect(DB_URI);

var db = mongoose.connection;
db.on('error', console.error.bind(console, '[Connection Error]:'));
db.once('open', function() {
  console.info('DB connected');
});

module.exports = mongoose;
