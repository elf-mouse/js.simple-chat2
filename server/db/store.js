var redis = require('redis');
// redis.createClient(port, host, options);
var client = redis.createClient(config.redis.port, config.redis.host, config.redis.options);
var msg_count = 0;


client.on('error', function(err) {
  console.error('[Redis Error]:' + err);
});

client.on('connect', function() {
  console.log('redis connected...');
});


function createKey(userId) {
  return 'user:' + userId + ':unread';
}

module.exports.add = function(userId, friendId) {
  var args = [createKey(userId), 1, friendId];
  client.zadd(args, function(err, res) {
    if (err) throw err;
  });
};

module.exports.delete = function(userId, friendId) {
  var args = [createKey(userId), friendId];
  client.zrem(args, function(err, res) {
    if (err) throw err;
  });
};

module.exports.update = function(userId, friendId) {
  var args = [createKey(userId), 1, friendId];
  client.zincrby(args, function(err, res) {
    if (err) throw err;
  });
};

module.exports.get = function(userId, friendId, callback) {
  var args = [createKey(userId), friendId];
  client.zscore(args, function(err, res) {
    if (err) throw err;
    callback(+res); // important
  });
};

module.exports.getAll = function(userId, callback) {
  var args = [createKey(userId), 0, -1, 'WITHSCORES'];
  client.zrange(args, function(err, res) {
    if (err) throw err;

    var result = [];
    var item = {};
    res.map(function(value, index) {
      if (index % 2 === 0) {
        item = {
          id: +value
        };
      } else {
        item.unread = +value;
        result.push(item);
      }
    });

    callback(result);
  });
};
