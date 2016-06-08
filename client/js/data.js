var data = {
  "patient": [{
    "id": 1,
    "username": "用户-甲"
  }, {
    "id": 2,
    "username": "用户-乙",
    "binding": {
      "nurseId": 3,
      "nurseName": "秘书-C"
    }
  }, {
    "id": 3,
    "username": "用户-丙"
  }, {
    "id": 4,
    "username": "用户-丁"
  }],
  "nurse": [{
    "id": 1,
    "username": "秘书-A"
  }, {
    "id": 2,
    "username": "秘书-B"
  }, {
    "id": 3,
    "username": "秘书-C",
    "binding": {
      "patientId": 2,
      "patientName": "用户-乙"
    }
  }]
};

module.exports = data;
