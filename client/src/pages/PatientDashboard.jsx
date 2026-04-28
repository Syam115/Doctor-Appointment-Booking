import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import AppointmentCard from '../components/AppointmentCard';
import {
  cancelAppointment,
  getPatientHistory,
  rescheduleAppointment,
} from '../services/appointmentService';

export default function PatientDashboard() {
  const { userInfo, userToken } = useSelector((state) => state.auth);
  const [appts, setAppts] = useState([]);
  const [reschedule, setReschedule] = useState({});

  const loadAppointments = async () => {
    try {
      const { data } = await getPatientHistory(userToken);
      setAppts(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let ignore = false;

    getPatientHistory(userToken)
      .then(({ data }) => {
        if (!ignore) {
          setAppts(data);
        }
      })
      .catch(console.error);

    return () => {
      ignore = true;
    };
  }, [userToken]);

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id, userToken);
      await loadAppointments();
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  const handleReschedule = async (id) => {
    try {
      const payload = reschedule[id];

      if (!payload?.date || !payload?.start_time) {
        alert('Please choose both a new date and a time slot before rescheduling.');
        return;
      }

      await rescheduleAppointment(id, payload, userToken);
      setReschedule((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      await loadAppointments();
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

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

        <div className="button-row">
          <Link to="/appointments/history" className="btn btn-secondary">Full History</Link>
          <Link to="/notifications" className="btn btn-secondary">Notifications</Link>
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
                <AppointmentCard key={appt._id} appointment={appt}>
                  <div className="appointment-meta">
                    <span>Appointment ID: {appt._id.slice(-6).toUpperCase()}</span>
                    <span>Hospital: {appt.doctorId?.hospital || 'N/A'}</span>
                  </div>
                  {appt.status !== 'Cancelled' && appt.status !== 'Completed' ? (
                    <div className="stack-sm">
                      <div className="inline-form-grid">
                        <input
                          type="date"
                          className="form-input"
                          value={reschedule[appt._id]?.date || ''}
                          onChange={(e) => setReschedule((current) => ({
                            ...current,
                            [appt._id]: { ...current[appt._id], date: e.target.value },
                          }))}
                        />
                        <select
                          className="form-input"
                          value={reschedule[appt._id]?.start_time || ''}
                          onChange={(e) => setReschedule((current) => ({
                            ...current,
                            [appt._id]: {
                              ...current[appt._id],
                              start_time: e.target.value,
                              end_time: 'To be determined',
                            },
                          }))}
                        >
                          <option value="">Select slot</option>
                          {(appt.doctorId?.availableSlots || []).map((slot) => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </div>
                      <div className="button-row">
                        <button type="button" className="btn btn-secondary" onClick={() => handleReschedule(appt._id)}>
                          Reschedule
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => handleCancel(appt._id)}>
                          Cancel Appointment
                        </button>
                      </div>
                    </div>
                  ) : null}
                </AppointmentCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
