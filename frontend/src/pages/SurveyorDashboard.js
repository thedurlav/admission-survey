import React, { useState, useEffect, useCallback } from 'react';
import Topbar from '../components/Topbar';
import StudentForm from '../components/StudentForm';
import StudentTable from '../components/StudentTable';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

export default function SurveyorDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('add');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/students/my');
      setStudents(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'list') loadStudents();
  }, [tab, loadStudents]);

  const filtered = students.filter(s =>
    search === '' ||
    s.childName.toLowerCase().includes(search.toLowerCase()) ||
    s.location.toLowerCase().includes(search.toLowerCase()) ||
    s.mobileNo.includes(search)
  );

  return (
    <div className="page">
      <Topbar />

      <div className="dash-header">
        <div className="dash-greeting">Welcome, {user?.fullName?.split(' ')[0]} 👋</div>
        <div className="dash-sub">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="nav-tabs">
        <button className={`nav-tab ${tab === 'add' ? 'active' : ''}`} onClick={() => setTab('add')}>
          ＋ Add New Survey
        </button>
        <button className={`nav-tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>
          📋 My Surveys {students.length > 0 && tab === 'list' ? `(${students.length})` : ''}
        </button>
      </div>

      <div className="content">
        {tab === 'add' && (
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">New Student Survey</div>
              <span className="badge badge-blue">Field Entry</span>
            </div>
            <div className="card-body">
              <StudentForm onSuccess={() => setTab('list')} />
            </div>
          </div>
        )}

        {tab === 'list' && (
          <div className="fade-in">
            {!loading && students.length > 0 && (
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-label">Total Surveyed</div>
                  <div className="stat-number">{students.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Today</div>
                  <div className="stat-number">
                    {students.filter(s => {
                      const d = new Date(s.surveyDate);
                      const t = new Date();
                      return d.toDateString() === t.toDateString();
                    }).length}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">This Week</div>
                  <div className="stat-number">
                    {students.filter(s => {
                      const d = new Date(s.surveyDate);
                      const now = new Date();
                      const weekAgo = new Date(now - 7 * 86400000);
                      return d >= weekAgo;
                    }).length}
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <div className="card-title">My Surveys</div>
                <div className="search-bar">
                  <div className="search-input-wrap">
                    <span className="search-icon">🔍</span>
                    <input
                      className="search-input" placeholder="Search by name, location..."
                      value={search} onChange={e => setSearch(e.target.value)}
                      style={{ width: 200 }}
                    />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="loading"><div className="spinner"></div> Loading surveys...</div>
              ) : (
                <StudentTable students={filtered} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
