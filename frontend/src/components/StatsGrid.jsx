import React from 'react';
import { ClipboardList, CheckCircle2, Clock, Flame } from 'lucide-react';

const StatsGrid = ({ stats, loading }) => {
  const statsConfig = [
    {
      label: 'Total Tasks',
      value: stats?.total || 0,
      icon: <ClipboardList size={22} />,
      color: 'var(--primary)',
    },
    {
      label: 'Completed',
      value: stats?.completed || 0,
      icon: <CheckCircle2 size={22} style={{ color: 'var(--success)' }} />,
      color: 'var(--success)',
    },
    {
      label: 'Pending',
      value: stats?.pending || 0,
      icon: <Clock size={22} style={{ color: 'var(--warning)' }} />,
      color: 'var(--warning)',
    },
    {
      label: 'High Priority (Pending)',
      value: stats?.highPriority || 0,
      icon: <Flame size={22} style={{ color: 'var(--danger)' }} />,
      color: 'var(--danger)',
    },
  ];

  if (loading) {
    return (
      <div className="stats-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card" style={{ height: '106px' }}>
            <div style={{ width: '60%' }}>
              <div className="skeleton skeleton-text" style={{ width: '40%', height: '28px' }}></div>
              <div className="skeleton skeleton-text" style={{ width: '80%', height: '14px', marginTop: '8px' }}></div>
            </div>
            <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)' }}></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stats-grid">
      {statsConfig.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
          <div className="stat-icon" style={{ borderColor: `rgba(255, 255, 255, 0.08)` }}>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
