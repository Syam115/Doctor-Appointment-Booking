import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function formatDate(date) {
  if (!date) return 'TBD';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function PatientDashboard() {
  const { userInfo, userToken } = useSelector((state) => state.auth);
  const [appts, setAppts] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/appointments/history`, {
      headers: { Authorization: `Bearer ${userToken}` },
    }).then((res) => setAppts(res.data)).catch(console.error);
  }, [userToken]);

  return (
    <section className="dashboard-layout animate-fade-in">
      <aside className="dashboard-sidebar glass">
        <div>
          <span className="eyebrow">Patient Suite</span>
          <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>{userInfo?.name}</h2>
          <p>Track your appointment requests and their current status.</p>
        </div>

        <div className="metric-card">
          <strong>{appts.length}</strong>
          <span>Appointments Logged</span>
        </div>

        <div className="metric-card">
          <strong>{userInfo?.role || 'patient'}</strong>
          <span>Active Portal</span>
        </div>
      </aside>

      <div className="dashboard-main">
        <div className="dashboard-metrics">
          <div className="metric-card">
            <strong>{appts.filter((appt) => appt.status === 'Pending').length}</strong>
            <span>Pending</span>
          </div>
          <div className="metric-card">
            <strong>{appts.filter((appt) => appt.status === 'Confirmed').length}</strong>
            <span>Confirmed</span>
          </div>
          <div className="metric-card">
            <strong>{appts.filter((appt) => appt.status === 'Cancelled').length}</strong>
            <span>Cancelled</span>
          </div>
        </div>

        <div className="panel luxury-card">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Care Timeline</span>
              <h3>My Appointments</h3>
            </div>
            <span className="status-pill success">Patient View</span>
          </div>

          {appts.length === 0 ? (
            <div className="empty-state">
              <h3 style={{ marginBottom: '0.75rem' }}>No appointments booked yet</h3>
              <p>Your booking requests will appear here.</p>
            </div>
          ) : (
            <div className="appointment-list">
              {appts.map((appt) => (
                <article key={appt._id} className="appointment-card">
                  <div className="panel-header" style={{ marginBottom: 0 }}>
                    <h3 style={{ marginBottom: 0 }}>{appt.doctorId?.name || formatDate(appt.date)}</h3>
                    <span className={`status-pill ${appt.status === 'Confirmed' ? 'success' : appt.status === 'Cancelled' ? 'error' : ''}`}>
                      {appt.status}
                    </span>
                  </div>
                  <div className="appointment-meta">
                    <span>Date: {formatDate(appt.date)}</span>
                    <span>Time: {appt.start_time}</span>
                    <span>Doctor: {appt.doctorId?.specialization || 'N/A'}</span>
                    <span>Appointment ID: {appt._id.slice(-6).toUpperCase()}</span>
                  </div>
                  <p>Reason: {appt.reason}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
