var SERVER = {
  host: '10.21.202.214', // '10.21.168.185',
  port: 8080
};

var CONFIG = {
  imgPath: '../img'
};

var ROLE_TYPE = {
  patient: 0,
  nurse: 1
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
