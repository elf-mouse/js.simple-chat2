### 连接

```
var socket = io('ws://host:port');

socket.on('connect');
```

## 断线

```
socket.on('disconnected', function() {

});
```

### 登录

```
// 患者数据
var user = {
  id: 1，
  username: '用户名1',
  type: 0,
  tag_id: 1
  binding: {
    id: 2,
    username: '绑定用户名2'
  }
};

// 秘书数据
var user = {
  id: 2，
  username: '用户名2',
  type: 1,
  tag_id: 1
  binding: [{
    id: 1,
    username: '绑定用户名1'
  }, {
    id: 3,
    username: '绑定用户名3'
  }]
};

socket.emit('login', user);
```

> `user` 基本结构参照 `js/data.js`

```
// 已登录
socket.on('userExisted', function() {

});

/**
 * 登录成功
 * @param  {[array]} data 消息列表
 */
socket.on('loginSuccess', function(data) {

});

/**
 * 更新在线状态
 *
 * user.id 用户ID
 * user.username 用户名
 * user.isOnline 是否上线
 */
socket.on('updateOnlineUser', function(user) {

});
```

### 收发消息

```
socket.emit('message', receiverId, message);
```

```
/**
 * 接收消息
 *
 * data.senderId 发送者ID
 * data.message 消息内容
 * data.unread 未读消息
 */
socket.on('message', function(data) {

});
```

### 收发图片

```
// 使用 FileReader 读取图片内容 e.target.result
// 具体代码参照 js/admin/image.js
socket.emit('image', receiverId, e.target.result);
```

```
/**
 * 接收图片
 *
 * data.senderId 发送者ID
 * data.message 图片内容
 * data.unread 未读消息
 */
socket.on('image', function(data) {

});
```

### 历史消息

```
socket.emit('loadMessage');
```

```
/**
 * 接收历史消息
 * @param  {[array]} data 消息列表
 */
socket.on('loadMessage', function(data) {

});
```

### 接待用户

```
socket.emit('call', receiver);
```

> `receiver` 结构参照 `js/data.js`

### 转接用户

```
socket.emit('callForwarding', patient, nurse);
```

> `patient` 和 `nurse` 结构参照 `js/data.js`

```
/**
 * 转接通知
 *
 * data.nurse 秘书绑定信息
 * data.patinet 患者绑定信息
 */
socket.on('callForwarding', function(data) {
  console.log('护士' + data.nurse.username + '已将病人' + data.patient.username + '转入您名下');
});
```
