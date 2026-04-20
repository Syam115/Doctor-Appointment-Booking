const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Admin = require('../models/Admin');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

const DEFAULT_PORTAL_PASSWORD = process.env.DEFAULT_PORTAL_PASSWORD || 'mockpassword';

const defaultDoctors = [
    {
        doctor_id: 'DOC-001',
        name: 'Dr. Emma Carter',
        specialization: 'Cardiology',
        experience: 12,
        hospital: 'MediLuxe Heart Institute',
        fee: 120,
        email: 'doctor1@mediluxe.com',
        availableSlots: ['09:00 AM', '11:30 AM', '03:00 PM'],
    },
    {
        doctor_id: 'DOC-002',
        name: 'Dr. Noah Bennett',
        specialization: 'Dermatology',
        experience: 9,
        hospital: 'MediLuxe Skin Clinic',
        fee: 90,
        email: 'doctor2@mediluxe.com',
        availableSlots: ['10:00 AM', '01:00 PM', '04:30 PM'],
    },
    {
        doctor_id: 'DOC-003',
        name: 'Dr. Olivia Hayes',
        specialization: 'Neurology',
        experience: 14,
        hospital: 'MediLuxe Neuro Center',
        fee: 140,
        email: 'doctor3@mediluxe.com',
        availableSlots: ['08:30 AM', '12:30 PM', '05:00 PM'],
    },
];

async function ensureCollections() {
    const models = [User, Doctor, Admin, Appointment, Notification];

    for (const model of models) {
        try {
            await model.createCollection();
        } catch (error) {
            if (error.codeName !== 'NamespaceExists') {
                throw error;
            }
        }
    }
}

async function ensureSeedData() {
    for (const doctorSeed of defaultDoctors) {
        const existingDoctor = await Doctor.findOne({ email: doctorSeed.email });

        if (!existingDoctor) {
            await Doctor.create({ ...doctorSeed, password: DEFAULT_PORTAL_PASSWORD });
        } else if (!existingDoctor.password) {
            await Doctor.updateOne({ _id: existingDoctor._id }, { $set: { password: await bcrypt.hash(DEFAULT_PORTAL_PASSWORD, 10) } });
        }
    }

    const existingAdmin = await Admin.findOne({ email: 'admin@mediluxe.com' });
    if (!existingAdmin) {
        await Admin.create({
            admin_id: 'ADMIN-001',
            name: 'Platform Administrator',
            email: 'admin@mediluxe.com',
            phone: '+91 99999 99999',
            password: DEFAULT_PORTAL_PASSWORD,
        });
    } else if (!existingAdmin.password) {
        await Admin.updateOne({ _id: existingAdmin._id }, { $set: { password: await bcrypt.hash(DEFAULT_PORTAL_PASSWORD, 10) } });
    }
}

module.exports = async function bootstrap() {
    await ensureCollections();
    await ensureSeedData();

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Bootstrap ready: ${collections.length} collections available`);
};
