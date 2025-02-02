const express = require('express');
const studentController = require('../controllers/student');

const router = express.Router();

router.get('/allstudents',studentController.getAllStudents);
router.post('/addStudentData',studentController.addStudentData);
router.delete('/delete/:id',studentController.deleteStudent);
router.put('/edit/:id',studentController.editStudent);

module.exports = router;