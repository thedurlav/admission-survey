import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Topbar() {
  const { user, logout } = useAuth();
  return (
    <div className="topbar">
      <div className="topbar-brand">
        <div className="topbar-logo">A</div>
        <div>
          <div className="topbar-title">AdmissionTrack</div>
          <div className="topbar-sub">School Survey System</div>
        </div>
      </div>
      {user && (
        <div className="topbar-right">
          <div className="topbar-user">
            <div className="topbar-username">{user.fullName}</div>
            <div className="topbar-role">{user.role}</div>
          </div>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
}
