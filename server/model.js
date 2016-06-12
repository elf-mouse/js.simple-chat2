var patient = {
  id: 'id',
  username: 'username',
  role: 'role',
  binding: {
    id: 'nurseId',
    username: 'nurseName'
  }
};

var nurse = {
  id: 'id',
  username: 'username',
  role: 'role',
  binding: {
    id: 'patientId',
    username: 'patientName'
  }
};

module.exports = {
  patient: patient,
  nurse: nurse
};
