import React from 'react';

function ELDLogSheet({ day, drivingHours, isFirstDay, isLastDay, offDutyHours, sleeperBerthHours, onDutyHours }) {
  const statuses = ['Off Duty', 'Sleeper Berth', 'Driving', 'On Duty'];

  const statusColors = {
    'Off Duty': '#3b82f6',
    'Sleeper Berth': '#7c3aed',
    'Driving': '#16a34a',
    'On Duty': '#f59e0b',
  };

  const dHours = parseFloat(drivingHours) || 0.0;
  const sHours = parseFloat(sleeperBerthHours) !== undefined ? parseFloat(sleeperBerthHours) : (!isLastDay ? 8.0 : 0.0);
  const oDuty = parseFloat(onDutyHours) !== undefined ? parseFloat(onDutyHours) : (isFirstDay ? 2.0 : (isLastDay ? 1.0 : 0.0));
  const offDuty = parseFloat(offDutyHours) !== undefined ? parseFloat(offDutyHours) : (24.0 - (dHours + sHours + oDuty));

  const segments = [];
  let hour = 0;

  if (oDuty > 0) {
    segments.push({ status: 'On Duty', start: hour, end: hour + oDuty });
    hour += oDuty;
  }

  if (dHours > 0) {
    segments.push({ status: 'Driving', start: hour, end: hour + dHours });
    hour += dHours;
  }

  if (sHours > 0) {
    segments.push({ status: 'Sleeper Berth', start: hour, end: hour + sHours });
    hour += sHours;
  }

  if (hour < 24) {
    segments.push({ status: 'Off Duty', start: hour, end: 24 });
  }

  const totals = { 'Off Duty': offDuty, 'Sleeper Berth': sHours, 'Driving': dHours, 'On Duty': oDuty };

  const statusRowIndex = {
    'Off Duty': 0,
    'Sleeper Berth': 1,
    'Driving': 2,
    'On Duty': 3,
  };

  const cellWidth = 25;
  const rowHeight = 36;
  const labelWidth = 120;
  const chartHeight = 4 * rowHeight;
  const chartWidth = 24 * cellWidth;

  return (
    <div className="eld-card">
      <div className="eld-header">
        <h4 className="eld-title">Daily Log Sheet — Day {day}</h4>
        <div className="badge-row">
          {statuses.map((status) => (
            <span key={status} className="badge" style={{ backgroundColor: statusColors[status] }}>
              {status}: {totals[status].toFixed(1)} hrs
            </span>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <svg width={labelWidth + chartWidth + 20} height={chartHeight + 60}>
          {statuses.map((status, i) => (
            <text
              key={status}
              x="0"
              y={35 + i * rowHeight + rowHeight / 2 + 4}
              fontSize="12"
              fill="#475569"
              fontWeight="600"
            >
              {status}
            </text>
          ))}

          {statuses.map((_, i) => (
            <rect
              key={`bg-${i}`}
              x={labelWidth}
              y={25 + i * rowHeight}
              width={chartWidth}
              height={rowHeight}
              fill={i % 2 === 0 ? '#f8fafc' : '#ffffff'}
            />
          ))}

          {Array.from({ length: 25 }).map((_, h) => (
            <line
              key={`v-${h}`}
              x1={labelWidth + h * cellWidth}
              y1={25}
              x2={labelWidth + h * cellWidth}
              y2={25 + chartHeight}
              stroke={h % 6 === 0 ? '#94a3b8' : '#e2e8f0'}
              strokeWidth={h % 6 === 0 ? 1.5 : 0.8}
            />
          ))}

          {Array.from({ length: 5 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1={labelWidth}
              y1={25 + i * rowHeight}
              x2={labelWidth + chartWidth}
              y2={25 + i * rowHeight}
              stroke="#e2e8f0"
              strokeWidth="0.8"
            />
          ))}

          {Array.from({ length: 25 }).map((_, h) => (
            <text
              key={`t-${h}`}
              x={labelWidth + h * cellWidth}
              y="18"
              fontSize="10"
              fill="#64748b"
              textAnchor="middle"
            >
              {h}
            </text>
          ))}

          {segments.map((seg, idx) => {
            const y = 25 + statusRowIndex[seg.status] * rowHeight + rowHeight / 2;
            const x1 = labelWidth + seg.start * cellWidth;
            const x2 = labelWidth + seg.end * cellWidth;
            const color = statusColors[seg.status];
            return (
              <g key={idx}>
                <rect
                  x={x1}
                  y={25 + statusRowIndex[seg.status] * rowHeight + 4}
                  width={x2 - x1}
                  height={rowHeight - 8}
                  fill={color}
                  opacity="0.15"
                  rx="3"
                />
                <line
                  x1={x1} y1={y}
                  x2={x2} y2={y}
                  stroke={color}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {idx < segments.length - 1 && (
                  <line
                    x1={x2}
                    y1={y}
                    x2={x2}
                    y2={25 + statusRowIndex[segments[idx + 1].status] * rowHeight + rowHeight / 2}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                  />
                )}
              </g>
            );
          })}

          {['Midnight', '6 AM', 'Noon', '6 PM', 'Midnight'].map((label, i) => (
            <text
              key={label}
              x={labelWidth + i * 6 * cellWidth}
              y={25 + chartHeight + 18}
              fontSize="10"
              fill="#94a3b8"
              textAnchor="middle"
            >
              {label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

export default ELDLogSheet;