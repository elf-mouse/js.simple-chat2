var SERVER = {
  host: '10.21.168.185',
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
