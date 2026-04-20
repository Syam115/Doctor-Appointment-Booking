const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

exports.getStats = async (req, res) => {
    try {
        const [
            patients,
            doctors,
            appointments,
            pendingAppointments,
            confirmedAppointments,
            recentAppointments
        ] = await Promise.all([
            User.countDocuments(),
            Doctor.countDocuments(),
            Appointment.countDocuments(),
            Appointment.countDocuments({ status: 'Pending' }),
            Appointment.countDocuments({ status: 'Confirmed' }),
            Appointment.find({})
                .populate('patientId', 'name email')
                .populate('doctorId', 'name specialization')
                .sort({ createdAt: -1 })
                .limit(10)
        ]);

        res.json({
            totals: {
                patients,
                doctors,
                appointments,
                pendingAppointments,
                confirmedAppointments
            },
            appointments: recentAppointments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
