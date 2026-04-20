const mongoose = require('mongoose');

const apptSchema = new mongoose.Schema({
    appointment_id: String,
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: String, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, default: 'To be determined' },
    reason: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', apptSchema);
