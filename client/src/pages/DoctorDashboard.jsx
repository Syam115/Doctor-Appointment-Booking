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

export default function DoctorDashboard() {
  const { userInfo, userToken } = useSelector((state) => state.auth);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/appointments/doctor`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setAppointments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [userToken]);

  const updateStatus = async (appointmentId, status) => {
    try {
      const { data } = await axios.put(
        `${API_URL}/appointments/${appointmentId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${userToken}` } },
      );

      setAppointments((current) => current.map((appt) => (appt._id === appointmentId ? data : appt)));
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  const pendingCount = appointments.filter((appt) => appt.status === 'Pending').length;
  const confirmedCount = appointments.filter((appt) => appt.status === 'Confirmed').length;

  return (
    <section className="dashboard-layout animate-fade-in">
      <aside className="dashboard-sidebar glass">
        <div>
          <span className="eyebrow">Doctor Workspace</span>
          <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>{userInfo?.name || 'Doctor Portal'}</h2>
          <p>Review patient requests and confirm or cancel each appointment.</p>
        </div>

        <div className="metric-card">
          <strong>{pendingCount}</strong>
          <span>Pending Requests</span>
        </div>

        <div className="metric-card">
          <strong>{confirmedCount}</strong>
          <span>Confirmed Visits</span>
        </div>
      </aside>

      <div className="dashboard-main">
        <div className="panel luxury-card">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Appointments</span>
              <h3>Patient Requests</h3>
            </div>
            <span className="status-pill">Doctor View</span>
          </div>

          {loading ? (
            <div className="loading-state">
              <p>Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">
              <h3 style={{ marginBottom: '0.75rem' }}>No appointment requests yet</h3>
              <p>New patient bookings will appear here.</p>
            </div>
          ) : (
            <div className="appointment-list">
              {appointments.map((appt) => (
                <article key={appt._id} className="appointment-card">
                  <div className="panel-header" style={{ marginBottom: 0 }}>
                    <h3 style={{ marginBottom: 0 }}>{appt.patientId?.name || 'Patient'}</h3>
                    <span className={`status-pill ${appt.status === 'Confirmed' ? 'success' : appt.status === 'Cancelled' ? 'error' : ''}`}>
                      {appt.status}
                    </span>
                  </div>
                  <div className="appointment-meta">
                    <span>Date: {formatDate(appt.date)}</span>
                    <span>Time: {appt.start_time}</span>
                    <span>Email: {appt.patientId?.email || 'N/A'}</span>
                  </div>
                  <p>Reason: {appt.reason}</p>
                  <div className="button-row" style={{ marginTop: '0.35rem' }}>
                    <button type="button" className="btn btn-primary" onClick={() => updateStatus(appt._id, 'Confirmed')}>
                      Confirm
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => updateStatus(appt._id, 'Cancelled')}>
                      Cancel
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
