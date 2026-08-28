import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function RaiseComplaint() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const [desc, setDesc] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!desc.trim()) {
      setError('Description is required');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('workerId', currentUser.id);
      formData.append('description', desc.trim());
      if (file) formData.append('attachment', file);

      const res = await axios.post(`${API_URL}/complaint`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setMessage('Complaint raised successfully!');
        setTimeout(() => navigate('/worker-dashboard'), 1500);
      }
    } catch (err) {
      setError('Failed to raise complaint');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main" style={{ padding: '2rem', maxWidth: '720px', margin: '0 auto' }}>
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ marginTop: 0 }}>Raise Complaint</h2>
        <p className="text-muted">Report a problem related to your work or operations.</p>

        {message && <p className="text-success">{message}</p>}
        {error && <p className="text-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Describe the issue..."
            value={desc}
            onChange={e => setDesc(e.target.value)}
            rows={8}
            required
            disabled={loading}
          />
          <label style={{ display: 'block', margin: '0.6rem 0 0.4rem', color: 'var(--text-secondary)' }}>
            Attach Photo/Video (optional):
          </label>
          <input type="file" accept="image/*,video/*" onChange={e => setFile(e.target.files[0])} disabled={loading} />
          <div className="flex" style={{ marginTop: '0.8rem' }}>
            <button type="submit" className="btn w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Complaint'}
            </button>
            <button type="button" className="btn secondary w-full" onClick={() => navigate('/worker-dashboard')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RaiseComplaint;