import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function NewRequest() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const [type, setType] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMsg('');

    if (!type.trim() || !desc.trim()) {
      setErrorMsg('Type and description are required');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/request`, {
        residentId: currentUser.id,
        type: type.trim(),
        description: desc.trim(),
      });
      setMessage('Request submitted successfully!');
      setTimeout(() => {
        navigate('/resident-dashboard');
      }, 1500);
    } catch (err) {
      setErrorMsg('Failed to submit request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main" style={{ padding: '2rem', maxWidth: '720px', margin: '0 auto' }}>
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ marginTop: 0 }}>New Request</h2>
        <p className="text-muted">Submit a new problem report for your area.</p>

        {message && <p className="text-success">{message}</p>}
        {errorMsg && <p className="text-error">{errorMsg}</p>}

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Issue Type (e.g., Overflowing bin)"
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={loading}
          />
          <textarea
            placeholder="Describe the issue..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={8}
            disabled={loading}
          />
          <div className="flex" style={{ marginTop: '0.8rem' }}>
            <button type="submit" className="btn w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button
              type="button"
              className="btn secondary w-full"
              onClick={() => navigate('/resident-dashboard')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewRequest;