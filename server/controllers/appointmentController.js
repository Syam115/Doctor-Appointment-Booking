const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, start_time, end_time, reason } = req.body;

        const appointmentExists = await Appointment.findOne({
            doctorId,
            date,
            start_time,
            status: { $in: ['Pending', 'Confirmed'] }
        });

        if (appointmentExists) {
            return res.status(400).json({ message: 'Slot already booked' });
        }

        const appointment = await Appointment.create({
            patientId: req.user._id,
            doctorId,
            date,
            start_time,
            end_time,
            reason,
            status: 'Pending'
        });

        await Notification.create({
            appointment_id: appointment._id,
            message: 'Appointment request submitted',
            sent_at: new Date(),
            status: 'Unread',
            type: 'Booking'
        });

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('doctorId', 'name specialization hospital')
            .populate('patientId', 'name email phone');

        res.status(201).json(populatedAppointment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getPatientHistory = async (req, res) => {
    try {
        const appts = await Appointment.find({ patientId: req.user._id })
            .populate('doctorId', 'name specialization hospital fee')
            .sort({ createdAt: -1 });
        res.json(appts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getDoctorAppointments = async (req, res) => {
    try {
        const appts = await Appointment.find({ doctorId: req.user._id })
            .populate('patientId', 'name email phone')
            .sort({ createdAt: -1 });
        res.json(appts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllAppointments = async (req, res) => {
    try {
        const appts = await Appointment.find({})
            .populate('patientId', 'name email phone')
            .populate('doctorId', 'name specialization hospital')
            .sort({ createdAt: -1 });
        res.json(appts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['Pending', 'Confirmed', 'Cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const appt = await Appointment.findById(req.params.id);
        if (!appt) return res.status(404).json({ message: 'Appointment not found' });

        if (req.user.role === 'doctor' && String(appt.doctorId) !== String(req.user._id)) {
            return res.status(403).json({ message: 'You can only manage your own appointments' });
        }

        appt.status = status;
        await appt.save();

        await Notification.create({
            appointment_id: appt._id,
            message: `Appointment status updated to ${status}`,
            sent_at: new Date(),
            status: 'Unread',
            type: 'Status Update'
        });

        const populatedAppointment = await Appointment.findById(appt._id)
            .populate('patientId', 'name email phone')
            .populate('doctorId', 'name specialization hospital');

        res.json(populatedAppointment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
