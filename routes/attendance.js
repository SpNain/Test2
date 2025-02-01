const express = require('express');
const attendanceController = require('../controllers/attendance');

const router = express.Router();

router.get('/home', attendanceController.getHomePage);
router.post('/attendancedatawithdate', attendanceController.addAttendanceDataWithDate);
router.get('/:date', attendanceController.getDateUI);

module.exports = router;