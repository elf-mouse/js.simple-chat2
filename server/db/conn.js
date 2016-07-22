var mongoose = require('mongoose');

var DB_URI = 'mongodb://' + config.mongo.auth + config.mongo.host + ':' + config.mongo.port + '/' + config.mongo.name;
mongoose.connect(DB_URI);

var mongodb = mongoose.connection;
mongodb.on('error', console.error.bind(console, '[Connection Error]:'));
mongodb.once('open', function() {
  console.info('DB connected...');
});

module.exports = mongoose;
