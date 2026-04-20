import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/auth/register`, form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  return (
    <section className="auth-shell animate-fade-in">
      <div className="form-container glass auth-card">
        <span className="eyebrow">Account Setup</span>
        <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>Get started with MediLuxe.</h2>
        <p className="auth-copy" style={{ marginBottom: '1.75rem' }}>
          Create a patient account to book appointments with available doctors.
        </p>

        {error ? <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div> : null}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" required onChange={handleChange('name')} placeholder="Aarav Sharma" />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" required onChange={handleChange('email')} placeholder="you@example.com" />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" required onChange={handleChange('password')} placeholder="Create a secure password" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer-text" style={{ marginTop: '1.25rem' }}>
          Already registered? <Link to="/login" style={{ color: 'var(--text)' }}>Sign in here</Link>.
        </p>
      </div>
    </section>
  );
}
