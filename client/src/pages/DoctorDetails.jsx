import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export default function DoctorDetails() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/doctors/${id}`).then((res) => setDoc(res.data)).catch(console.error);
  }, [id]);

  if (!doc) {
    return <div className="loading-state luxury-card animate-fade-in">Loading doctor profile...</div>;
  }

  return (
    <section className="detail-layout animate-fade-in">
      <aside className="detail-sidebar glass">
        <span className="eyebrow">Clinical Snapshot</span>
        <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>{doc.name}</h2>
        <p>{doc.specialization}</p>

        <div className="dashboard-metrics" style={{ marginTop: '1.5rem', gridTemplateColumns: '1fr' }}>
          <div className="metric-card">
            <strong>{doc.experience}</strong>
            <span>Years Experience</span>
          </div>
          <div className="metric-card">
            <strong>${doc.fee}</strong>
            <span>Consultation Fee</span>
          </div>
        </div>

        <Link to="/book" state={{ doc }} className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
          Proceed to Booking
        </Link>
      </aside>

      <div className="detail-main">
        <article className="profile-card luxury-card">
          <div className="profile-header">
            <div>
              <span className="eyebrow">Doctor Profile</span>
              <h1 className="section-title">{doc.name}</h1>
            </div>
            <span className="status-pill">{doc.specialization}</span>
          </div>

          <p className="section-copy">
            Review doctor information, check available slots, and continue to booking.
          </p>

          <div className="profile-highlight">
            <div className="panel">
              <h3>Hospital</h3>
              <p>{doc.hospital}</p>
            </div>
            <div className="panel">
              <h3>Expertise</h3>
              <p>{doc.specialization}</p>
            </div>
            <div className="panel">
              <h3>Availability</h3>
              <p>Same elegant booking flow across available slots.</p>
            </div>
          </div>

          <h3 style={{ marginBottom: '1rem' }}>Available appointment windows</h3>
          <div className="slots">
            {doc.availableSlots?.map((slot) => (
              <span key={slot} className="slot-chip">{slot}</span>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
