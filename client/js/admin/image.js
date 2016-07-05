import socket from '../common/socket';
import { showMessage, showImage } from '../common/util';

document.getElementById('image').addEventListener('change', function() {
  if (!window.user) {
    alert('未登录');
    return false;
  }

  var sender = window.user;
  var receiverId = window.receiverId;

  if (this.files.length !== 0) {
    var file = this.files[0];
    var reader = new FileReader();

    if (!reader) {
      console('your browser doesn\'t support fileReader');
      this.value = '';
      return;
    };

    reader.onload = function(e) {
      this.value = '';
      socket.emit('image', receiverId, e.target.result);
      showImage(sender.id, e.target.result);
    };

    reader.readAsDataURL(file);
  };
}, false);
