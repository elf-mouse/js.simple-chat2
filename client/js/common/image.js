import { socket, showMessage, showImage } from './util';

document.getElementById('image').addEventListener('change', function() {
  var username = document.getElementById('user-a').value;
  var someone = document.getElementById('user-b').value;

  if (this.files.length !== 0) {
    var file = this.files[0];
    var reader = new FileReader();

    if (!reader) {
      showMessage('system', 'your browser doesn\'t support fileReader');
      this.value = '';
      return;
    };

    reader.onload = function(e) {
      this.value = '';
      socket.emit('image', someone, e.target.result);
      showImage(username, e.target.result);
    };

    reader.readAsDataURL(file);
  };
}, false);

// 接收图片
socket.on('image', function(user, imgData) {
  showImage(user, imgData);
});
