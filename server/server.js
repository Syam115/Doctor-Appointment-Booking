const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const bootstrap = require('./config/bootstrap');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
// app.use('/api/notifications', require('./routes/notificationRoutes'));
// app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));

app.use(require('./middleware/errorMiddleware'));

const PORT = process.env.PORT || 5000;

async function startServer() {
    await connectDB();
    await bootstrap();

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startServer().catch((error) => {
    console.error('Server startup failed:', error);
    process.exit(1);
});
