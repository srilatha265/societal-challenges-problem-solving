import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
const assetBase = API_URL.replace('/api', '');

function ResidentDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('pending');
  const [requestType, setRequestType] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [requestAttachment, setRequestAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [feedbackDrafts, setFeedbackDrafts] = useState({});
  const [feedbackAttachment, setFeedbackAttachment] = useState(null);
  const [feedbackSubmittingId, setFeedbackSubmittingId] = useState(null);

  const fetchRequests = useCallback(async (showLoading = true) => {
    if (!currentUser?.id) return;

    try {
      if (showLoading) setLoading(true);
      setError('');
      const res = await axios.get(`${API_URL}/data`);
      const myRequests = (res.data.requests || []).filter((req) => req.resident_id === currentUser.id);
      setRequests(myRequests);
    } catch (err) {
      setError('Failed to load requests');
      console.error('Fetch error:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'resident') {
      navigate('/login');
      return;
    }

    const nameHeader = document.getElementById('resident-name-header');
    if (nameHeader) {
      nameHeader.textContent = currentUser.name || 'Citizen';
    }

    fetchRequests(true);

    const intervalId = window.setInterval(() => {
      fetchRequests(false);
    }, 8000);

    return () => window.clearInterval(intervalId);
  }, [currentUser, navigate, fetchRequests]);

  const renderStatus = (status) => {
    const variant = status === 'Completed' ? 'success' : status === 'Assigned' ? 'info' : 'warning';
    return <span className={`status-pill status-${variant}`}>{status}</span>;
  };

  const totalRequests = requests.length;
  const pendingCount = requests.filter((req) => ['Pending', 'Assigned'].includes(req.status)).length;
  const completedCount = requests.filter((req) => req.status === 'Completed').length;
  const pendingRequests = requests.filter((req) => ['Pending', 'Assigned'].includes(req.status));
  const completedRequests = requests.filter((req) => req.status === 'Completed');

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setSubmitMessage('');
    setSubmitError('');

    if (!requestType.trim() || !requestDescription.trim()) {
      setSubmitError('Please enter the issue type and description.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('residentId', currentUser.id);
      formData.append('type', requestType.trim());
      formData.append('description', requestDescription.trim());
      if (requestAttachment) {
        formData.append('attachment', requestAttachment);
      }

      await axios.post(`${API_URL}/request`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSubmitMessage('Request submitted successfully!');
      setRequestType('');
      setRequestDescription('');
      setRequestAttachment(null);
      setActiveView('pending');
      fetchRequests(true);
    } catch (err) {
      setSubmitError('Failed to submit request.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (requestId) => {
    const draft = feedbackDrafts[requestId] || {};

    if (!draft.rating || !draft.feedback?.trim()) {
      setSubmitError('Please choose a rating and add feedback before submitting.');
      return;
    }

    setFeedbackSubmittingId(requestId);
    setSubmitMessage('');
    setSubmitError('');

    try {
      const formData = new FormData();
      formData.append('requestId', requestId);
      formData.append('rating', Number(draft.rating));
      formData.append('feedback', draft.feedback.trim());
      if (feedbackAttachment) {
        formData.append('feedbackAttachment', feedbackAttachment);
      }

      await axios.post(`${API_URL}/rate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSubmitMessage('Feedback submitted successfully.');
      fetchRequests(true);
    } catch (err) {
      setSubmitError('Failed to submit feedback.');
      console.error(err);
    } finally {
      setFeedbackSubmittingId(null);
    }
  };

  const updateFeedbackDraft = (requestId, key, value) => {
    setFeedbackDrafts((prev) => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        [key]: value,
      },
    }));
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="eyebrow">Resident workspace</div>
          <h3>Citizen</h3>
          <p>Track every service request in one place.</p>
        </div>

        <div className="nav-list">
          <button
            className={`nav-link ${activeView === 'raise' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('raise');
              setSubmitError('');
              setSubmitMessage('');
            }}
          >
            Raise request
          </button>
          <button
            className={`nav-link ${activeView === 'pending' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('pending');
              setSubmitError('');
              setSubmitMessage('');
            }}
          >
            Pending requests
          </button>
          <button
            className={`nav-link ${activeView === 'completed' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('completed');
              setSubmitError('');
              setSubmitMessage('');
            }}
          >
            Completed requests
          </button>
        </div>

        <button
          className="btn secondary w-full"
          style={{ marginTop: 'auto' }}
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          Logout
        </button>
      </aside>

      <main className="main">
        <header className="page-header">
          <div>
            <p className="page-subtitle">Welcome back</p>
            <h1 className="page-title">
              Hello, <span id="resident-name-header">{currentUser?.name || 'Citizen'}</span>
            </h1>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Raised requests</div>
            <div className="stat-value">{totalRequests}</div>
            <div className="stat-caption">All requests submitted</div>
          </div>
          <div className="stat-card success">
            <div className="stat-label">Completed requests</div>
            <div className="stat-value">{completedCount}</div>
            <div className="stat-caption">Resolved successfully</div>
          </div>
          <div className="stat-card accent">
            <div className="stat-label">Pending requests</div>
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-caption">Awaiting action</div>
          </div>
        </section>

        <section className="panel-section">
          {activeView === 'raise' ? (
            <div>
              <div className="section-header">
                <div>
                  <h2 className="section-title">Raise a new request</h2>
                  <p className="section-copy">Submit a report that the city team can act on quickly.</p>
                </div>
              </div>
              {submitMessage && <p className="text-success">{submitMessage}</p>}
              {submitError && <p className="text-error">{submitError}</p>}
              <form onSubmit={handleCreateRequest} className="request-form">
                <input
                  placeholder="Issue type (e.g. Streetlight)"
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  required
                />
                <textarea
                  placeholder="Describe the issue in detail..."
                  value={requestDescription}
                  onChange={(e) => setRequestDescription(e.target.value)}
                  rows={7}
                  required
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setRequestAttachment(e.target.files[0])}
                />
                <button type="submit" className="btn w-full" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit request'}
                </button>
              </form>
            </div>
          ) : activeView === 'pending' ? (
            <div>
              <div className="section-header">
                <div>
                  <h2 className="section-title">Pending requests</h2>
                  <p className="section-copy">Requests that are still being reviewed or assigned.</p>
                </div>
              </div>
              {loading ? (
                <p className="text-muted">Loading your requests...</p>
              ) : error ? (
                <p className="text-error">{error}</p>
              ) : pendingRequests.length === 0 ? (
                <div className="empty-state">
                  <p>No pending requests at the moment.</p>
                </div>
              ) : (
                <div className="stack-list">
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="card">
                      <div className="flex justify-between items-start mb-2">
                        <h3>{req.type || 'Untitled request'}</h3>
                        {renderStatus(req.status)}
                      </div>
                      <p className="text-muted mb-3">{req.description || 'No description provided'}</p>
                      {req.attachment && (
                        <a href={`${assetBase}/uploads/${req.attachment}`} target="_blank" rel="noreferrer" className="text-muted">
                          View attachment
                        </a>
                      )}
                      <div className="small-text mt-2">
                        Submitted: {req.created_at ? new Date(req.created_at).toLocaleString() : 'Not available'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="section-header">
                <div>
                  <h2 className="section-title">Completed requests</h2>
                  <p className="section-copy">Close the loop with feedback once a request is resolved.</p>
                </div>
              </div>
              {loading ? (
                <p className="text-muted">Loading your requests...</p>
              ) : error ? (
                <p className="text-error">{error}</p>
              ) : completedRequests.length === 0 ? (
                <div className="empty-state">
                  <p>No completed requests yet.</p>
                </div>
              ) : (
                <div className="stack-list">
                  {completedRequests.map((req) => (
                    <div key={req.id} className="card">
                      <div className="flex justify-between items-start mb-2">
                        <h3>{req.type || 'Untitled request'}</h3>
                        {renderStatus(req.status)}
                      </div>
                      <p className="text-muted mb-3">{req.description || 'No description provided'}</p>
                      {req.attachment && (
                        <a href={`${assetBase}/uploads/${req.attachment}`} target="_blank" rel="noreferrer" className="text-muted">
                          View attachment
                        </a>
                      )}
                      <div className="small-text mt-2">
                        Completed: {req.created_at ? new Date(req.created_at).toLocaleString() : 'Not available'}
                      </div>

                      <div className="feedback-box">
                        {req.rating || req.feedback ? (
                          <div>
                            <strong>Your feedback</strong>
                            <p className="small-text">Rating: {req.rating}/5</p>
                            <p className="small-text">{req.feedback || 'No feedback provided.'}</p>
                          </div>
                        ) : (
                          <form
                            className="feedback-form"
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleFeedbackSubmit(req.id);
                            }}
                          >
                            <label htmlFor={`rating-${req.id}`}>Rate this service</label>
                            <select
                              id={`rating-${req.id}`}
                              value={feedbackDrafts[req.id]?.rating || ''}
                              onChange={(e) => updateFeedbackDraft(req.id, 'rating', e.target.value)}
                              required
                            >
                              <option value="">Select rating</option>
                              <option value="5">5 - Excellent</option>
                              <option value="4">4 - Very Good</option>
                              <option value="3">3 - Good</option>
                              <option value="2">2 - Fair</option>
                              <option value="1">1 - Poor</option>
                            </select>
                            <textarea
                              placeholder="Share your feedback with the admin..."
                              value={feedbackDrafts[req.id]?.feedback || ''}
                              onChange={(e) => updateFeedbackDraft(req.id, 'feedback', e.target.value)}
                              rows={4}
                              required
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setFeedbackAttachment(e.target.files[0])}
                            />
                            <button type="submit" className="btn small-btn" disabled={feedbackSubmittingId === req.id}>
                              {feedbackSubmittingId === req.id ? 'Submitting...' : 'Submit feedback'}
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ResidentDashboard;