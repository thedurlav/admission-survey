import React from 'react';

export default function StudentTable({ students, showSurveyor = false, onDelete }) {
  if (!students.length) {
    return (
      <div className="empty">
        <div className="empty-icon">📋</div>
        <div className="empty-text">No student surveys found</div>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Child Name</th>
            <th>Father Name</th>
            <th>Class</th>
            <th>Medium</th>
            <th>Location</th>
            <th>Mobile</th>
            <th>Prev. School</th>
            {showSurveyor && <th>Surveyed By</th>}
            <th>Date</th>
            <th>Remarks</th>
            {onDelete && <th></th>}
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => (
            <tr key={s._id} className="fade-in">
              <td style={{ color: 'var(--gray-400)', fontSize: '12px' }}>{i + 1}</td>
              <td style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{s.childName}</td>
              <td>{s.fatherName}</td>
              <td>
                <span className="badge badge-blue">
                  {['Nursery','KG'].includes(s.class) ? s.class : `Cls ${s.class}`}
                </span>
              </td>
              <td><span className="badge badge-gray">{s.medium}</span></td>
              <td>{s.location}</td>
              <td style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>{s.mobileNo}</td>
              <td style={{ color: 'var(--gray-400)', fontSize: '12px' }}>{s.previousSchool || '—'}</td>
              {showSurveyor && (
                <td>
                  <span className="badge badge-amber">
                    {s.surveyedBy?.fullName || 'Admin'}
                  </span>
                </td>
              )}
              <td style={{ fontSize: '12px', color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>
                {s.surveyDate ? new Date(s.surveyDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
              </td>
              <td style={{ fontSize: '12px', color: 'var(--gray-400)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.remarks || '—'}
              </td>
              {onDelete && (
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(s._id)}>✕</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
