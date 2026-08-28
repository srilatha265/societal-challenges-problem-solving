import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

function SupervisorDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState({
    residents: [],
    workers: [],
    requests: [],
    complaints: [],
    pendingResidents: [],
    pendingWorkers: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('dash');

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  useEffect(() => {
    if (currentUser?.role !== 'supervisor') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [currentUser, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_URL}/data`);
      setData(res.data);
    } catch (err) {
      setError('Failed to load data. Check backend.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, role) => {
    if (!window.confirm(`Approve this ${role}?`)) return;
    try {
      await axios.post(`${API_URL}/approve`, { id, role });
      alert('Approved!');
      fetchData();
    } catch (_err) {
      console.error(_err);
      alert('Approve failed');
    }
  };

  const handleRemove = async (id, role) => {
    if (!window.confirm(`Remove this ${role}?`)) return;
    try {
      await axios.post(`${API_URL}/delete-user`, { id, role });
      alert('Removed!');
      fetchData();
    } catch (_err) {
      console.error(_err);
      alert('Remove failed');
    }
  };

  const openAssign = (requestId) => {
    setSelectedRequestId(requestId);
    setAssignModalOpen(true);
  };

  const confirmAssign = async () => {
    const workerId = document.getElementById('worker-select')?.value;
    if (!workerId) return alert('Select a worker');

    try {
      await axios.post(`${API_URL}/assign`, {
        requestId: selectedRequestId,
        workerId,
      });
      alert('Assigned!');
      setAssignModalOpen(false);
      fetchData();
    } catch (_err) {
      alert('Assign failed');
      console.error(_err);
    }
  };

  const renderView = () => {
    if (loading) return <p className="text-muted">Loading...</p>;
    if (error) return <p className="text-error">{error}</p>;

    if (activeView === 'dash') {
      return (
        <div className="dashboard-grid">
          <div className="panel-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Incoming requests</h2>
                <p className="section-copy">Assign each request to the right worker.</p>
              </div>
            </div>
            <div className="table-shell">
              <table id="requests-table">
                <thead>
                  <tr>
                    <th>Citizen</th>
                    <th>Type</th>
                    <th>Worker</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.requests.map((req) => {
                    const citizen = data.residents.find((r) => r.id === req.resident_id);
                    const worker = data.workers.find((w) => w.id === req.assigned_worker_id);
                    return (
                      <tr key={req.id}>
                        <td>{citizen?.full_name || 'Unknown'}</td>
                        <td>{req.type}</td>
                        <td>{worker ? worker.full_name : 'Unassigned'}</td>
                        <td>
                          {!worker ? (
                            <button className="btn small-btn" onClick={() => openAssign(req.id)}>
                              Assign
                            </button>
                          ) : (
                            <span className="status-pill status-info">{req.status}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Worker complaints</h2>
                <p className="section-copy">Monitor issues raised during operations.</p>
              </div>
            </div>
            <div id="complaints-list" className="stack-list">
              {data.complaints.length === 0 ? (
                <div className="empty-state"><p>No complaints yet.</p></div>
              ) : (
                data.complaints.map((c) => (
                  <div key={c.id} className="card complaint-card">
                    <div className="flex justify-between">
                      <strong>{c.worker_name}</strong>
                      <small className="small-text">{new Date(c.created_at).toLocaleDateString()}</small>
                    </div>
                    <p className="text-muted">{c.description}</p>
                    {c.attachment && (
                      <a href={`${API_URL.replace('/api', '')}/uploads/${c.attachment}`} target="_blank" rel="noreferrer" className="text-muted">
                        View file
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    if (activeView === 'res') {
      return (
        <div className="panel-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Citizens</h2>
              <p className="section-copy">Review resident records and manage access.</p>
            </div>
          </div>
          <div className="table-shell">
            <table id="residents-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.residents.map((cit) => (
                  <tr key={cit.id}>
                    <td>{cit.full_name}</td>
                    <td>{cit.phone || '-'}</td>
                    <td>{cit.address || '-'}</td>
                    <td>
                      <button className="btn small-btn secondary" onClick={() => handleRemove(cit.id, 'resident')}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeView === 'work') {
      return (
        <div className="panel-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Workers</h2>
              <p className="section-copy">Manage worker accounts and performance context.</p>
            </div>
          </div>
          <div className="table-shell">
            <table id="workers-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.workers.map((w) => (
                  <tr key={w.id}>
                    <td>{w.full_name}</td>
                    <td>{w.phone || '-'}</td>
                    <td>{w.performance_score || 0}</td>
                    <td>
                      <button className="btn small-btn secondary" onClick={() => handleRemove(w.id, 'worker')}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeView === 'app') {
      return (
        <div className="panel-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Pending approvals</h2>
              <p className="section-copy">Review new citizen and worker registrations.</p>
            </div>
          </div>
          <div id="approvals-list" className="stack-list">
            {data.pendingResidents.length + data.pendingWorkers.length === 0 ? (
              <div className="empty-state"><p>No pending approvals.</p></div>
            ) : (
              <>
                {data.pendingResidents.map((p) => (
                  <div key={p.id} className="card approval-card">
                    <div className="flex justify-between items-center">
                      <div>
                        <strong>{p.full_name}</strong>
                        <div className="small-text">{p.email || p.phone || '-'}</div>
                      </div>
                      <button className="btn small-btn" onClick={() => handleApprove(p.id, 'resident')}>
                        Approve
                      </button>
                    </div>
                  </div>
                ))}

                {data.pendingWorkers.map((p) => (
                  <div key={p.id} className="card approval-card">
                    <div className="flex justify-between items-center">
                      <div>
                        <strong>{p.full_name}</strong>
                        <div className="small-text">{p.email || p.phone || '-'}</div>
                      </div>
                      <button className="btn small-btn" onClick={() => handleApprove(p.id, 'worker')}>
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      );
    }

    if (activeView === 'report') {
      const feedbackRequests = data.requests.filter((req) => req.feedback || req.rating);
      return (
        <div className="panel-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Resident feedback reports</h2>
              <p className="section-copy">Keep an eye on public sentiment and completed service outcomes.</p>
            </div>
          </div>
          {feedbackRequests.length === 0 ? (
            <div className="empty-state"><p>No resident feedback has been submitted yet.</p></div>
          ) : (
            <div className="stack-list">
              {feedbackRequests.map((req) => {
                const resident = data.residents.find((r) => r.id === req.resident_id);
                return (
                  <div key={req.id} className="card">
                    <div className="flex justify-between items-start mb-2">
                      <strong>{resident?.full_name || 'Unknown resident'}</strong>
                      <span className="status-pill status-info">{req.status}</span>
                    </div>
                    <p className="text-muted"><strong>Request:</strong> {req.type}</p>
                    <p className="text-muted"><strong>Rating:</strong> {req.rating ? `${req.rating}/5` : 'N/A'}</p>
                    <p className="text-muted"><strong>Feedback:</strong> {req.feedback || 'No feedback provided.'}</p>
                    {req.feedback_attachment && (
                      <div className="mt-2">
                        <strong>Attached image:</strong>
                        <br />
                        <a href={`${API_URL.replace('/api', '')}/uploads/${req.feedback_attachment}`} target="_blank" rel="noreferrer" className="text-muted">
                          View feedback image
                        </a>
                      </div>
                    )}
                    <div className="small-text mt-2">{req.created_at ? new Date(req.created_at).toLocaleString() : ''}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="eyebrow">Administration</div>
          <h3>Supervisor</h3>
          <p>Monitor requests, approvals, and team activity.</p>
        </div>
        <div className="nav-list">
          <button className={`nav-link ${activeView === 'dash' ? 'active' : ''}`} onClick={() => setActiveView('dash')}>
            Dashboard
          </button>
          <button className={`nav-link ${activeView === 'res' ? 'active' : ''}`} onClick={() => setActiveView('res')}>
            Citizens
          </button>
          <button className={`nav-link ${activeView === 'work' ? 'active' : ''}`} onClick={() => setActiveView('work')}>
            Workers
          </button>
          <button className={`nav-link ${activeView === 'app' ? 'active' : ''}`} onClick={() => setActiveView('app')}>
            Approvals
          </button>
          <button className={`nav-link ${activeView === 'report' ? 'active' : ''}`} onClick={() => setActiveView('report')}>
            Report
          </button>
        </div>
        <button className="btn secondary w-full" style={{ marginTop: 'auto' }} onClick={() => { logout(); navigate('/'); }}>
          Logout
        </button>
      </aside>

      <main className="main">
        <header className="page-header">
          <div>
            <p className="page-subtitle">Operations center</p>
            <h1 className="page-title">Welcome, <span id="supervisor-name">{currentUser?.name || 'Admin'}</span></h1>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Open requests</div>
            <div className="stat-value">{data.requests.length}</div>
            <div className="stat-caption">Requests currently in the system</div>
          </div>
          <div className="stat-card success">
            <div className="stat-label">Citizens</div>
            <div className="stat-value">{data.residents.length}</div>
            <div className="stat-caption">Registered residents</div>
          </div>
          <div className="stat-card accent">
            <div className="stat-label">Workers</div>
            <div className="stat-value">{data.workers.length}</div>
            <div className="stat-caption">Available field staff</div>
          </div>
        </section>

        <div className="fade-in">{renderView()}</div>
      </main>

      {assignModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Assign worker</h3>
            <select id="worker-select">
              <option value="">Select worker...</option>
              {data.workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.full_name} (Score: {w.performance_score || 0})
                </option>
              ))}
            </select>
            <div className="flex mt-2">
              <button className="btn w-full" onClick={confirmAssign}>Assign</button>
              <button className="btn secondary w-full" onClick={() => setAssignModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupervisorDashboard;