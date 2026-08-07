import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import api from './api/axios';

import ChatWidget from './components/ChatWidget';

import Explore from './pages/Explore';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ItemDetail from './pages/ItemDetail';
import ReportItem from './pages/ReportItem';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

// Redirects admin users away from any non-admin page to /admin
function AdminRedirect({ children }) {
  const { isAdmin } = useAuth();
  if (isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

function HandshakeWrapper({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [healthData, setHealthData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const checkConnection = async () => {
    setStatus('loading');
    try {
      const response = await api.get('/health');
      if (response.data && response.data.success) {
        setHealthData(response.data);
        setStatus('success');
      } else {
        throw new Error(response.data?.message || 'Invalid health response');
      }
    } catch (err) {
      console.error('Handshake failed:', err);
      setErrorMsg(err.message || 'Backend is currently offline or unreachable.');
      setStatus('error');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-200">Connecting to Server</h1>
        <p className="text-sm text-slate-400 mt-2">Checking backend handshake...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/5">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-red-400">Connection Failed</h1>
        <p className="text-sm text-slate-400 mt-2 max-w-md text-center">{errorMsg}</p>
        <button
          onClick={checkConnection}
          className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Handshake Success Banner */}
      <div className="bg-emerald-600 text-white py-2 px-4 text-xs font-semibold text-center flex items-center justify-center gap-2 animate-fade-in">
        <span>✅ Backend Connected</span>
        <span className="opacity-75">|</span>
        <span>{healthData?.message}</span>
        <span className="opacity-75">|</span>
        <span className="font-mono">{healthData?.timestamp}</span>
      </div>
      {children}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <HandshakeWrapper>
        <Router>
          <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
            <Navbar />
            <div className="flex-1">
              <Routes>
                {/* Public Routes — admins are redirected to /admin (except ItemDetail so they can preview items) */}
                <Route path="/" element={<AdminRedirect><Explore /></AdminRedirect>} />
                <Route path="/login" element={<AdminRedirect><Login /></AdminRedirect>} />
                <Route path="/signup" element={<AdminRedirect><Signup /></AdminRedirect>} />
                <Route path="/items/:id" element={<ItemDetail />} />

                {/* Protected Routes — admins redirected to /admin */}
                <Route
                  path="/report"
                  element={
                    <ProtectedRoute>
                      <AdminRedirect><ReportItem /></AdminRedirect>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <AdminRedirect><Dashboard /></AdminRedirect>
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Route */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <Admin />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback Catch-all Route */}
                <Route path="*" element={<AdminRedirect><Navigate to="/" replace /></AdminRedirect>} />
              </Routes>
            </div>
            <ChatWidget />
          </div>
        </Router>
      </HandshakeWrapper>
    </AuthProvider>
  );
}


export default App;
