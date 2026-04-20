import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export default function BookAppointment() {
  const location = useLocation();
  const navigate = useNavigate();
  const doc = location.state?.doc;
  const { userToken } = useSelector((state) => state.auth);

  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!doc) {
    return <div className="empty-state luxury-card animate-fade-in">Please select a doctor before booking.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userToken) {
      alert('Please login first');
      return navigate('/login');
    }

    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/appointments`,
        { doctorId: doc._id, date, start_time: slot, end_time: 'To be determined', reason },
        { headers: { Authorization: `Bearer ${userToken}` } },
      );

      alert('Appointment request sent successfully.');
      navigate('/dashboard/patient');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  return (
    <section className="form-shell animate-fade-in">
      <aside className="form-side luxury-card">
        <span className="eyebrow">Appointment Details</span>
        <h1 className="section-title" style={{ marginBottom: '1rem' }}>Finalize your consultation.</h1>
        <p>
          You are booking with <strong style={{ color: 'var(--text)' }}>{doc.name}</strong>.
        </p>

        <div className="profile-highlight" style={{ marginTop: '1.5rem' }}>
          <div className="panel">
            <h3>Speciality</h3>
            <p>{doc.specialization}</p>
          </div>
          <div className="panel">
            <h3>Hospital</h3>
            <p>{doc.hospital}</p>
          </div>
          <div className="panel">
            <h3>Fee</h3>
            <p>${doc.fee}</p>
          </div>
        </div>
      </aside>

      <div className="form-container glass">
        <span className="eyebrow">Booking Form</span>
        <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>Reserve your visit.</h2>
        <p style={{ marginBottom: '1.75rem' }}>
          Select a date, choose a slot, and add the reason for your visit.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Date</label>
            <input type="date" className="form-input" required onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Available Time Slot</label>
            <select className="form-input" required onChange={(e) => setSlot(e.target.value)}>
              <option value="">Select a time</option>
              {doc.availableSlots?.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Visit</label>
            <textarea
              className="form-input"
              rows="4"
              required
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe symptoms, goals, or consultation notes"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.75rem' }}>
            {loading ? 'Submitting Request...' : 'Book Appointment'}
          </button>
        </form>
      </div>
    </section>
  );
}
