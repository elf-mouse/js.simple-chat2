require('../global');
var config = require('../config');
var data = {
  id: config.mongo.autoreplyId,
  start_week: 1,
  end_week: 5,
  start_time: '08:00',
  end_time: '18:00',
  content: "现在是非工作时间，我们会在工作时间立即答复您。工作时间周一至周五8:00至18:00"
};

DB.model('autoreply').where({ id: config.mongo.autoreplyId }).count(function(err, count) {
  if (err) console.error(err);
  if (!count) {
    var autoreply = new DB.model('autoreply')(data);
    autoreply.save(function(err) {
      if (err) {
        console.error(err);
      } else {
        console.log('autoreply init success');
      }
    });
  } else {
    console.log('autoreply init failure');
  }
});
