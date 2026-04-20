import { useEffect, useState } from 'react';
import axios from 'axios';
import DoctorCard from '../components/DoctorCard';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/doctors`).then((res) => setDoctors(res.data)).catch(console.error);
  }, []);

  return (
    <section className="section animate-fade-in">
      <div className="doctor-list-header">
        <div>
          <span className="eyebrow">Medical Advisory Board</span>
          <h1 className="section-title">Meet our specialists.</h1>
        </div>
        <p className="section-copy">
          Select a doctor to view the profile and book an available slot.
        </p>
      </div>

      {doctors.length === 0 ? (
        <div className="empty-state luxury-card">
          <h3 style={{ marginBottom: '0.75rem' }}>Loading specialists</h3>
          <p>The clinical network is being prepared for viewing.</p>
        </div>
      ) : (
        <div className="doctor-grid">
          {doctors.map((doc) => <DoctorCard key={doc._id} doc={doc} />)}
        </div>
      )}
    </section>
  );
}
