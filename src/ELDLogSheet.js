function ELDLogSheet({ day, drivingHours }) {
  const statuses = ['Off Duty', 'Sleeper Berth', 'Driving', 'On Duty'];

  const statusColors = {
    'Off Duty': '#3b82f6',       // Blue
    'Sleeper Berth': '#6b21a8',  // Dark Purple
    'Driving': '#16a34a',        // Green
    'On Duty': '#f59e0b',        // Amber
  };

  // Build timeline segments
  const segments = [];
  let hour = 0;

  segments.push({ status: 'On Duty', start: hour, end: hour + 1 });
  hour += 1;

  segments.push({ status: 'Driving', start: hour, end: hour + drivingHours });
  hour += drivingHours;

  segments.push({ status: 'On Duty', start: hour, end: hour + 1 });
  hour += 1;

  if (hour < 24) {
    segments.push({ status: 'Off Duty', start: hour, end: 24 });
  }

  // Calculate totals per status (for badges)
  const totals = { 'Off Duty': 0, 'Sleeper Berth': 0, 'Driving': 0, 'On Duty': 0 };
  segments.forEach((seg) => {
    totals[seg.status] += seg.end - seg.start;
  });

  const statusRowIndex = {
    'Off Duty': 0,
    'Sleeper Berth': 1,
    'Driving': 2,
    'On Duty': 3,
  };

  const cellWidth = 25;
  const rowHeight = 32;
  const labelWidth = 110;
  const chartHeight = 4 * rowHeight;
  const chartWidth = 24 * cellWidth;

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <h4 style={styles.cardTitle}>Daily Log Sheet — Day {day}</h4>
        <div style={styles.badgeRow}>
          {statuses.map((status) => (
            <span key={status} style={{ ...styles.badge, backgroundColor: statusColors[status] }}>
              {status}: {totals[status].toFixed(1)} hrs
            </span>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <svg width={labelWidth + chartWidth + 20} height={chartHeight + 50}>
          {/* Row labels */}
          {statuses.map((status, i) => (
            <text
              key={status}
              x="0"
              y={30 + i * rowHeight + rowHeight / 2 + 4}
              fontSize="12"
              fill="#374151"
              fontWeight="500"
            >
              {status}
            </text>
          ))}

          {/* Vertical grid lines (every hour) */}
          {Array.from({ length: 25 }).map((_, h) => (
            <line
              key={`v-${h}`}
              x1={labelWidth + h * cellWidth}
              y1={20}
              x2={labelWidth + h * cellWidth}
              y2={20 + chartHeight}
              stroke={h % 6 === 0 ? '#9ca3af' : '#e5e7eb'}
              strokeWidth={h % 6 === 0 ? 1.2 : 0.7}
            />
          ))}

          {/* Horizontal grid lines (rows) */}
          {Array.from({ length: 5 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1={labelWidth}
              y1={20 + i * rowHeight}
              x2={labelWidth + chartWidth}
              y2={20 + i * rowHeight}
              stroke="#e5e7eb"
              strokeWidth="0.7"
            />
          ))}

          {/* Hour labels */}
          {Array.from({ length: 25 }).map((_, h) => (
            <text key={`t-${h}`} x={labelWidth - 5 + h * cellWidth} y="14" fontSize="9" fill="#6b7280">
              {h}
            </text>
          ))}

          {/* Colored status line */}
          {segments.map((seg, idx) => {
            const y = 20 + statusRowIndex[seg.status] * rowHeight + rowHeight / 2;
            const x1 = labelWidth + seg.start * cellWidth;
            const x2 = labelWidth + seg.end * cellWidth;
            const color = statusColors[seg.status];
            return (
              <g key={idx}>
                <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth="3" strokeLinecap="round" />
                {/* Vertical connector to next segment */}
                {idx < segments.length - 1 && (
                  <line
                    x1={x2}
                    y1={y}
                    x2={x2}
                    y2={20 + statusRowIndex[segments[idx + 1].status] * rowHeight + rowHeight / 2}
                    stroke="#9ca3af"
                    strokeWidth="1.5"
                    strokeDasharray="2,2"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
    padding: '18px 20px',
    marginBottom: '20px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '12px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4b5563',
    margin: 0,
  },
  badgeRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  badge: {
    color: 'white',
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 8px',
    borderRadius: '12px',
  },
};

export default ELDLogSheet;