document.getElementById('face').addEventListener('click', function(e) {
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

function initEmoji() {
  var emojiContainer = document.getElementById('emoji-wrapper');
  var docFragment = document.createDocumentFragment();

  for (var i = 69; i > 0; i--) {
    var emojiItem = document.createElement('img');
    emojiItem.src = '../img/emoji/' + i + '.gif';
    emojiItem.title = i;
    docFragment.appendChild(emojiItem);
  }
  emojiContainer.appendChild(docFragment);
}

initEmoji();
