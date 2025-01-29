const express = require('express');
const userController = require('../controllers/user');

const router = express.Router();

router.get('/appointments',userController.getFormPage);
router.post('/appointments',userController.addUserDetails);
router.get('/allappointments',userController.getAllAppointments);
router.delete('/appointments/delete/:id',userController.deleteUserDetails);
router.put('/appointments/edit/:id',userController.editUserDetails);

module.exports = router;