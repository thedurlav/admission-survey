import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [role, setRole] = useState('surveyor');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError('Please enter username and password'); return; }
    setLoading(true);
    setError('');
    try {
      const user = await login(username, password);
      if (user.role !== role) {
        setError(`This account is not a ${role}. Please select the correct role.`);
        setLoading(false);
        return;
      }
      navigate(role === 'admin' ? '/admin' : '/surveyor');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">🏫</div>
        <div className="login-title">AdmissionTrack</div>
        <div className="login-sub">School Field Survey System</div>

        <div className="role-selector">
          {['surveyor', 'admin'].map(r => (
            <button
              key={r} type="button"
              className={`role-btn ${role === r ? 'selected' : ''}`}
              onClick={() => { setRole(r); setError(''); }}
            >
              <div className="role-btn-icon">{r === 'admin' ? '🛡️' : '📋'}</div>
              <div className="role-btn-label">{r === 'admin' ? 'Admin' : 'Surveyor'}</div>
            </button>
          ))}
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}
          <div className="form-group">
            <label>Username</label>
            <input
              value={username} onChange={e => setUsername(e.target.value)}
              placeholder={role === 'admin' ? 'admin' : 'surveyor1'}
              autoComplete="username" autoCapitalize="none"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {loading ? 'Signing in...' : `Sign in as ${role === 'admin' ? 'Admin' : 'Surveyor'}`}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--gray-400)', marginTop: '1.25rem' }}>
          Default: admin/admin123 · surveyor1/survey123
        </p>
      </div>
    </div>
  );
}
