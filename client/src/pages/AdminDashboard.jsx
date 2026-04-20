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

export default function AdminDashboard() {
  const { userInfo, userToken } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${userToken}` },
    }).then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userToken]);

  return (
    <section className="dashboard-layout animate-fade-in">
      <aside className="dashboard-sidebar glass">
        <div>
          <span className="eyebrow">Administration</span>
          <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>{userInfo?.name || 'Admin Portal'}</h2>
          <p>Monitor system activity, doctors, patients, and recent appointment requests.</p>
        </div>

        <div className="metric-card">
          <strong>{stats?.totals?.appointments ?? 0}</strong>
          <span>Total Appointments</span>
        </div>

        <div className="metric-card">
          <strong>{stats?.totals?.doctors ?? 0}</strong>
          <span>Doctors</span>
        </div>
      </aside>

      <div className="dashboard-main">
        <div className="dashboard-metrics">
          <div className="metric-card">
            <strong>{stats?.totals?.patients ?? 0}</strong>
            <span>Patients</span>
          </div>
          <div className="metric-card">
            <strong>{stats?.totals?.pendingAppointments ?? 0}</strong>
            <span>Pending</span>
          </div>
          <div className="metric-card">
            <strong>{stats?.totals?.confirmedAppointments ?? 0}</strong>
            <span>Confirmed</span>
          </div>
        </div>

        <div className="panel luxury-card">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Recent Activity</span>
              <h3>Latest Appointments</h3>
            </div>
            <span className="status-pill">Admin View</span>
          </div>

          {loading ? (
            <div className="loading-state">
              <p>Loading dashboard data...</p>
            </div>
          ) : !stats?.appointments?.length ? (
            <div className="empty-state">
              <h3 style={{ marginBottom: '0.75rem' }}>No appointments found</h3>
              <p>Appointments will appear here when patients start booking.</p>
            </div>
          ) : (
            <div className="appointment-list">
              {stats.appointments.map((appt) => (
                <article key={appt._id} className="appointment-card">
                  <div className="panel-header" style={{ marginBottom: 0 }}>
                    <h3 style={{ marginBottom: 0 }}>{appt.doctorId?.name || 'Doctor'}</h3>
                    <span className={`status-pill ${appt.status === 'Confirmed' ? 'success' : appt.status === 'Cancelled' ? 'error' : ''}`}>
                      {appt.status}
                    </span>
                  </div>
                  <div className="appointment-meta">
                    <span>Patient: {appt.patientId?.name || 'N/A'}</span>
                    <span>Date: {formatDate(appt.date)}</span>
                    <span>Time: {appt.start_time}</span>
                  </div>
                  <p>Specialization: {appt.doctorId?.specialization || 'N/A'}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
