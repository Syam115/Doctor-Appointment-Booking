const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const doctorSchema = new mongoose.Schema({
    doctor_id: String,
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    experience: { type: Number, default: 0 },
    hospital: { type: String, required: true },
    fee: { type: Number, default: 0 },
    availableSlots: { type: [String], default: [] },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { timestamps: true });

doctorSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

doctorSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Doctor', doctorSchema);
