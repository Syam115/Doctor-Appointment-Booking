const express = require('express'); const router = express.Router();
const {
    bookAppointment,
    getPatientHistory,
    getDoctorAppointments,
    getAllAppointments,
    updateStatus
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, Role } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize(Role.PATIENT), bookAppointment);
router.get('/history', protect, authorize(Role.PATIENT), getPatientHistory);
router.get('/doctor', protect, authorize(Role.DOCTOR), getDoctorAppointments);
router.get('/all', protect, authorize(Role.ADMIN), getAllAppointments);
router.put('/:id/status', protect, authorize(Role.DOCTOR, Role.ADMIN), updateStatus);
module.exports = router;
