import React from 'react';

function MetricCardComponent({ label, value, className = '', valueClassName = '' }) {
  return (
    <article className={`metric-card ${className}`.trim()}>
      <span>{label}</span>
      <strong className={valueClassName}>{value}</strong>
    </article>
  );
}

export const MetricCard = React.memo(MetricCardComponent);
