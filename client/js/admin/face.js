document.getElementById('face').addEventListener('click', function(e) {
  if (!window.user) {
    alert('未登录');
    return false;
  }

  var emojiWrapper = document.getElementById('emoji-wrapper');
  emojiWrapper.style.display = 'block';
  e.stopPropagation();
}, false);

document.body.addEventListener('click', function(e) {
  var emojiWrapper = document.getElementById('emoji-wrapper');
  if (e.target != emojiWrapper) {
    emojiWrapper.style.display = 'none';
  };
});

document.getElementById('emoji-wrapper').addEventListener('click', function(e) {
  var target = e.target;
  if (target.nodeName.toLowerCase() === 'img') {
    var messageInput = document.getElementById('message');
    messageInput.focus();
    messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
  };
}, false);
