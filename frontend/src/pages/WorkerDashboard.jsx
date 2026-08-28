import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
const assetBase = API_URL.replace('/api', '');

function WorkerDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('pending');

  const fetchTasks = useCallback(async (showLoading = true) => {
    if (!currentUser?.id) return;

    try {
      if (showLoading) setLoading(true);
      const res = await axios.get(`${API_URL}/data`);
      const myTasks = (res.data.requests || []).filter((r) => r.assigned_worker_id === currentUser.id);
      setTasks(myTasks);
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'worker') {
      navigate('/login');
      return;
    }

    fetchTasks(true);

    const intervalId = window.setInterval(() => {
      fetchTasks(false);
    }, 8000);

    return () => window.clearInterval(intervalId);
  }, [currentUser, navigate, fetchTasks]);

  const handleCompleteTask = async (taskId) => {
    if (!window.confirm('Mark this task as completed?')) return;
    try {
      await axios.post(`${API_URL}/work-complete`, { requestId: taskId });
      fetchTasks(true);
    } catch (err) {
      alert('Failed to complete task');
      console.error(err);
    }
  };

  const renderStatus = (status) => {
    const variant = status === 'Completed' ? 'success' : status === 'Assigned' ? 'info' : 'warning';
    return <span className={`status-pill status-${variant}`}>{status}</span>;
  };

  const pendingTasks = tasks.filter((task) => ['Pending', 'Assigned'].includes(task.status));
  const completedTasks = tasks.filter((task) => task.status === 'Completed');
  const visibleTasks = activeView === 'completed' ? completedTasks : pendingTasks;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="eyebrow">Operations workspace</div>
          <h3>Worker</h3>
          <p>Manage assigned requests from one place.</p>
        </div>

        <div className="nav-list">
          <button
            className={`nav-link ${activeView === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveView('pending')}
          >
            Pending requests
          </button>
          <button
            className={`nav-link ${activeView === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveView('completed')}
          >
            Completed requests
          </button>
          <button
            className="nav-link"
            onClick={() => navigate('/worker-dashboard/raise-complaint')}
          >
            Raise complaint
          </button>
        </div>

        <button className="btn secondary w-full" style={{ marginTop: 'auto' }} onClick={() => { logout(); navigate('/'); }}>
          Logout
        </button>
      </aside>

      <main className="main">
        <header className="page-header">
          <div>
            <p className="page-subtitle">Welcome back</p>
            <h1 className="page-title">Hello, <span>{currentUser?.name || 'Worker'}</span></h1>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Assigned requests</div>
            <div className="stat-value">{tasks.length}</div>
            <div className="stat-caption">All tasks assigned to you</div>
          </div>
          <div className="stat-card success">
            <div className="stat-label">Completed</div>
            <div className="stat-value">{completedTasks.length}</div>
            <div className="stat-caption">Successfully closed tasks</div>
          </div>
          <div className="stat-card accent">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{pendingTasks.length}</div>
            <div className="stat-caption">Still awaiting action</div>
          </div>
        </section>

        <section className="panel-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">{activeView === 'completed' ? 'Completed requests' : 'Pending requests'}</h2>
              <p className="section-copy">Keep the queue moving with focused task updates.</p>
            </div>
          </div>

          {loading ? (
            <p className="text-muted">Loading tasks...</p>
          ) : error ? (
            <p className="text-error">{error}</p>
          ) : visibleTasks.length === 0 ? (
            <div className="empty-state">
              <p>No {activeView === 'completed' ? 'completed' : 'pending'} requests to show.</p>
            </div>
          ) : (
            <div className="stack-list">
              {visibleTasks.map((task) => (
                <div key={task.id} className="card">
                  <div className="flex justify-between items-start mb-2">
                    <h3>{task.type || 'Untitled task'}</h3>
                    {renderStatus(task.status)}
                  </div>
                  <p className="text-muted mb-3">{task.description || 'No description'}</p>
                  {task.attachment && (
                    <a href={`${assetBase}/uploads/${task.attachment}`} target="_blank" rel="noreferrer" className="text-muted">
                      View attachment
                    </a>
                  )}
                  <div className="flex justify-between items-center mt-3">
                    <div className="small-text">
                      Submitted: {new Date(task.created_at).toLocaleDateString()}
                    </div>
                    {task.status === 'Assigned' && (
                      <button className="btn small-btn" onClick={() => handleCompleteTask(task.id)}>
                        Mark complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default WorkerDashboard;