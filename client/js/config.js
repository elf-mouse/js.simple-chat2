var SERVER = {
  host: '127.0.0.1',
  port: 8080
};

var CONFIG = {
  imgPath: '../img'
};

var ROLE_TYPE = {
  patient: 1,
  nurse: 2
};

var historyMessageObj = document.getElementById('history-message');

window.user = '';
window.receiverId = '';
window.historyMessageObj = historyMessageObj;
window.originHeight = historyMessageObj.scrollHeight;
window.hasMessage = true;

export {
  SERVER,
  CONFIG,
  ROLE_TYPE
};
