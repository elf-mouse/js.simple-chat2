var data = {
  patient: [{
    id: 1,
    username: '用户-甲',
    type: 0,
    tag_id: 1,
    binding: {
      id: 7,
      username: '秘书-C'
    },
    token: 'NmIzZGY3NzE3OTNmMTA2OTlmZjRkNTE0NjgzOTk2NzE='
  }, {
    id: 2,
    username: '用户-乙',
    binding: {},
  }, {
    id: 3,
    username: '用户-丙',
    binding: {
      id: 5,
      username: '秘书-A'
    }
  }, {
    id: 4,
    username: '用户-丁',
    binding: {
      id: 7,
      username: '秘书-C'
    }
  }],
  nurse: [{
    id: 5,
    username: '秘书-A',
    binding: [{
      id: 3,
      username: '用户-丙'
    }]
  }, {
    id: 6,
    username: '秘书-B',
    binding: []
  }, {
    id: 7,
    username: '秘书-C',
    binding: [{
      id: 1,
      username: '用户-甲'
    }, {
      id: 4,
      username: '用户-丁'
    }]
  }]
};

module.exports = data;
