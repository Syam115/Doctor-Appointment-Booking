const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res) => {
    const { name, email, password, phone, date_of_birth, role } = req.body;
    try {
        if (role !== 'patient') return res.status(400).json({ message: 'Only patients can register here' });
        
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password, phone, date_of_birth, role });
        res.status(201).json({
            _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id, user.role)
        });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.login = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        let user;
        if (role === 'patient') user = await User.findOne({ email });
        else if (role === 'doctor') user = await Doctor.findOne({ email });
        else if (role === 'admin') user = await Admin.findOne({ email });
        else return res.status(400).json({ message: 'Invalid role' });

        if (!user) return res.status(401).json({ message: 'Invalid email or password' });

        const isMatch = await user.matchPassword(password);

        if (isMatch) {
            res.json({ _id: user._id, name: user.name, email: user.email, role: role, token: generateToken(user._id, role) });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) { res.status(500).json({ message: error.message }); }
};
