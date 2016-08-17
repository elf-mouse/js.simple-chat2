var mongoose = require('mongoose');

var DB_URI = 'mongodb://' + config.mongo.host + ':' + config.mongo.port + '/' + config.mongo.name;
mongoose.connect(DB_URI, { user: config.mongo.user, pass: config.mongo.pass });

var mongodb = mongoose.connection;
mongodb.on('error', console.error.bind(console, '[Connection Error]:'));
mongodb.once('open', function() {
  console.info('DB connected...');
});

module.exports = mongoose;
