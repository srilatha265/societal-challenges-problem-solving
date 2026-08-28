import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/RegisterPage.jsx';
import ResidentDashboard from './pages/ResidentDashboard.jsx';
import NewRequest from './pages/NewRequest.jsx';
import WorkerDashboard from './pages/WorkerDashboard.jsx';
import RaiseComplaint from './pages/RaiseComplaint.jsx';
import SupervisorDashboard from './pages/SupervisorDashboard.jsx';

function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="main">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function ResidentLayout() {
  return <Outlet />;
}

function WorkerLayout() {
  return <Outlet />;
}

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/resident-dashboard"
          element={
            <ProtectedRoute allowedRoles={['resident']}>
              <ResidentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ResidentDashboard />} /> 
          <Route path="new-request" element={<NewRequest />} /> 
        </Route>

        <Route
          path="/worker-dashboard"
          element={
            <ProtectedRoute allowedRoles={['worker']}>
              <WorkerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<WorkerDashboard />} /> 
          <Route path="raise-complaint" element={<RaiseComplaint />} /> 
        </Route>

        <Route
          path="/supervisor-dashboard"
          element={
            <ProtectedRoute allowedRoles={['supervisor']}>
              <SupervisorDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<div className="main"><h1>404 - Page Not Found</h1></div>} />
      </Routes>
    </div>
  );
}

export default App;