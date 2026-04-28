const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const Doctor = require('../models/Doctor');
const checkDoctorAvailability = require('../utils/checkDoctorAvailability');

async function createNotification({ userId, userModel, appointmentId, message, type, meta = {} }) {
    return Notification.create({
        userId,
        userModel,
        appointment_id: appointmentId,
        message,
        sent_at: new Date(),
        status: 'Unread',
        type,
        channel: 'in-app',
        meta
    });
}

exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, start_time, end_time, reason } = req.body;
        const doctor = await Doctor.findById(doctorId);

        if (!doctor || doctor.approvalStatus !== 'Approved') {
            return res.status(400).json({ message: 'Doctor is not available for booking' });
        }

        if (!doctor.availableSlots.includes(start_time)) {
            return res.status(400).json({ message: 'Selected time is not in the doctor availability list' });
        }

        const appointmentExists = await checkDoctorAvailability({ doctorId, date, start_time });

        if (!appointmentExists) {
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

        await Promise.all([
            createNotification({
                userId: req.user._id,
                userModel: 'User',
                appointmentId: appointment._id,
                message: `Appointment request submitted with ${doctor.name} for ${date} at ${start_time}`,
                type: 'Booking',
                meta: { doctorName: doctor.name }
            }),
            createNotification({
                userId: doctor._id,
                userModel: 'Doctor',
                appointmentId: appointment._id,
                message: `New appointment request from ${req.user.name} on ${date} at ${start_time}`,
                type: 'Booking',
                meta: { patientName: req.user.name }
            })
        ]);

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('doctorId', 'name specialization hospital location fee')
            .populate('patientId', 'name email phone');

        res.status(201).json(populatedAppointment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.rescheduleAppointment = async (req, res) => {
    try {
        const { date, start_time, end_time } = req.body || {};

        if (!date || !start_time) {
            return res.status(400).json({ message: 'Please select both a new date and a new time slot' });
        }

        const appt = await Appointment.findById(req.params.id).populate('doctorId', 'name availableSlots');
        if (!appt) return res.status(404).json({ message: 'Appointment not found' });

        if (String(appt.patientId) !== String(req.user._id)) {
            return res.status(403).json({ message: 'You can only reschedule your own appointments' });
        }

        if (appt.status === 'Cancelled' || appt.status === 'Completed') {
            return res.status(400).json({ message: 'This appointment can no longer be rescheduled' });
        }

        if (!appt.doctorId.availableSlots.includes(start_time)) {
            return res.status(400).json({ message: 'Selected time is not available for this doctor' });
        }

        const isAvailable = await checkDoctorAvailability({
            doctorId: appt.doctorId._id,
            date,
            start_time,
            appointmentId: appt._id
        });

        if (!isAvailable) {
            return res.status(400).json({ message: 'Requested slot is already booked' });
        }

        appt.previousSchedules.push({
            date: appt.date,
            start_time: appt.start_time,
            end_time: appt.end_time,
            changedAt: new Date()
        });
        appt.date = date;
        appt.start_time = start_time;
        appt.end_time = end_time || appt.end_time;
        appt.rescheduledCount += 1;
        appt.status = 'Pending';
        await appt.save();

        await Promise.all([
            createNotification({
                userId: req.user._id,
                userModel: 'User',
                appointmentId: appt._id,
                message: `Appointment rescheduled to ${date} at ${start_time}`,
                type: 'Reschedule'
            }),
            createNotification({
                userId: appt.doctorId._id,
                userModel: 'Doctor',
                appointmentId: appt._id,
                message: `Patient requested a reschedule to ${date} at ${start_time}`,
                type: 'Reschedule'
            })
        ]);

        const populatedAppointment = await Appointment.findById(appt._id)
            .populate('patientId', 'name email phone')
            .populate('doctorId', 'name specialization hospital location fee');

        res.json(populatedAppointment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getPatientHistory = async (req, res) => {
    try {
        const appts = await Appointment.find({ patientId: req.user._id })
            .populate('doctorId', 'name specialization hospital location fee availableSlots')
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

        if (!['Pending', 'Confirmed', 'Cancelled', 'Completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const appt = await Appointment.findById(req.params.id);
        if (!appt) return res.status(404).json({ message: 'Appointment not found' });

        if (req.user.role === 'doctor' && String(appt.doctorId) !== String(req.user._id)) {
            return res.status(403).json({ message: 'You can only manage your own appointments' });
        }

        appt.status = status;
        if (status === 'Completed') {
            appt.completedAt = new Date();
        }
        await appt.save();

        await Promise.all([
            createNotification({
                userId: appt.patientId,
                userModel: 'User',
                appointmentId: appt._id,
                message: `Appointment status updated to ${status}`,
                type: 'Status Update'
            }),
            createNotification({
                userId: appt.doctorId,
                userModel: 'Doctor',
                appointmentId: appt._id,
                message: `Appointment status updated to ${status}`,
                type: 'Status Update'
            })
        ]);

        const populatedAppointment = await Appointment.findById(appt._id)
            .populate('patientId', 'name email phone')
            .populate('doctorId', 'name specialization hospital location');

        res.json(populatedAppointment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.cancelAppointmentByPatient = async (req, res) => {
    try {
        const appt = await Appointment.findById(req.params.id);
        if (!appt) return res.status(404).json({ message: 'Appointment not found' });

        if (String(appt.patientId) !== String(req.user._id)) {
            return res.status(403).json({ message: 'You can only cancel your own appointments' });
        }

        if (appt.status === 'Completed') {
            return res.status(400).json({ message: 'Completed appointments cannot be cancelled' });
        }

        appt.status = 'Cancelled';
        await appt.save();

        await Promise.all([
            createNotification({
                userId: req.user._id,
                userModel: 'User',
                appointmentId: appt._id,
                message: 'Appointment cancelled successfully',
                type: 'Cancellation'
            }),
            createNotification({
                userId: appt.doctorId,
                userModel: 'Doctor',
                appointmentId: appt._id,
                message: 'A patient cancelled an appointment',
                type: 'Cancellation'
            })
        ]);

        res.json(appt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
