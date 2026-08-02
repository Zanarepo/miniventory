import React from 'react';

interface ActivityChartProps {
  data: { date: string; users: number }[];
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}
      >
        No activity data available
      </div>
    );
  }

  // Find max value to scale the chart
  const maxUsers = Math.max(...data.map((d) => d.users), 1);
  const chartHeight = 160;

  return (
    <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '8px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
          height: `${chartHeight}px`,
          minWidth: 'max-content',
          paddingTop: '20px',
        }}
      >
        {data.map((point, i) => {
          const height = Math.max((point.users / maxUsers) * chartHeight, 4); // min height of 4px
          const isToday = i === data.length - 1;
          const dateObj = new Date(point.date);
          const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

          return (
            <div
              key={point.date}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                width: '32px',
              }}
            >
              <div
                title={`${dateStr}: ${point.users} active users`}
                style={{
                  width: '100%',
                  height: `${height}px`,
                  backgroundColor: isToday ? 'var(--brand-primary)' : 'var(--brand-primary)',
                  opacity: isToday ? 1 : 0.6,
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
              />
              <span
                style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}
              >
                {i % 3 === 0 || isToday ? dateStr : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
