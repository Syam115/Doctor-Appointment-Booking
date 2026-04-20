const mongoose = require('mongoose');

const notifSchema = new mongoose.Schema({
    notification_id: String,
    appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    message: String,
    sent_at: Date,
    status: String,
    type: String
}, { timestamps: true });

module.exports = mongoose.model('Notification', notifSchema);
