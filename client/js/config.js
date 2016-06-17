var SERVER = {
  host: '10.21.168.185',
  port: 3000
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
window.receiver = '';
window.historyMessageObj = historyMessageObj;
window.originHeight = historyMessageObj.scrollHeight;
window.hasMessage = true;

export {
  SERVER,
  CONFIG,
  ROLE_TYPE
};
