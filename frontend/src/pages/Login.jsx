import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx'; 

const API_URL = 'http://localhost:3000/api';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth() || {};

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await axios.post(`${API_URL}/login`, { username, password });
      const data = res.data;

      if (data.success) {
        const userData = {
          id: data.user.id,
          name: data.user.full_name || data.user.username,
          role: data.role,
        };

        if (login) login(userData);
        else localStorage.setItem('currentUser', JSON.stringify(userData));

        if (data.role === 'resident') navigate('/resident-dashboard');
        else if (data.role === 'worker') navigate('/worker-dashboard');
        else if (data.role === 'supervisor') navigate('/supervisor-dashboard');
      } else {
        setLoginError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed. Check server.');
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content fade-in" style={{ maxWidth: '430px', width: '92%' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
          <div style={{ display: 'inline-flex', width: '48px', height: '48px', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', background: 'linear-gradient(135deg, #f97316, #34d399)', fontWeight: 800, marginBottom: '0.6rem' }}>
            C
          </div>
          <h2 style={{ margin: '0 0 0.35rem' }}>Welcome Back</h2>
          <p className="text-muted" style={{ margin: 0 }}>Sign in to continue managing city requests.</p>
        </div>

        {loginError && (
          <p className="text-error text-center mb-4">{loginError}</p>
        )}

        <form onSubmit={handleLogin}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoggingIn}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoggingIn}
          />
          <button type="submit" className="btn w-full" disabled={isLoggingIn}>
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '1.2rem', textAlign: 'center' }}>
          <p className="text-muted" style={{ marginBottom: '0.7rem' }}>Don't have an account?</p>
          <button
            type="button"
            className="btn secondary w-full"
            onClick={() => navigate('/register')}
            disabled={isLoggingIn}
          >
            Register New Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;