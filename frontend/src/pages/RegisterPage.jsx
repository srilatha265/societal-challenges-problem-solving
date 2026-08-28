import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function RegisterPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState('resident');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccess(false);
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/register`, {
        role,
        username,
        password,
        name: fullName,
        phone: phone || null,
        email: email || null,
        address: address || null,
      });

      const data = res.data;
      setMessage(data.message);

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      }
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        'Registration failed. Username may be taken.'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="modal-content fade-in" style={{ maxWidth: '520px', width: '95%' }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'inline-flex', width: '48px', height: '48px', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', background: 'linear-gradient(135deg, #f97316, #34d399)', fontWeight: 800, marginBottom: '0.55rem' }}>
            A
          </div>
          <h2 style={{ margin: '0 0 0.35rem' }}>Create Account</h2>
          <p className="text-muted" style={{ margin: 0 }}>Join the city services network.</p>
        </div>

        {message && (
          <p style={{ color: success ? '#86efac' : '#fda4af', marginBottom: '1rem', textAlign: 'center' }}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <select value={role} onChange={(e) => setRole(e.target.value)} disabled={loading}>
            <option value="resident">Citizen</option>
            <option value="worker">Worker</option>
          </select>

          <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={loading} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
          <input placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required disabled={loading} />
          <div className="flex">
            <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading} />
            <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
          </div>
          <input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} disabled={loading} />

          <button type="submit" className="btn w-full" disabled={loading} style={{ marginTop: '0.6rem' }}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p className="text-muted" style={{ marginBottom: '0.6rem' }}>Already have an account?</p>
          <Link to="/login" className="btn secondary w-full">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;