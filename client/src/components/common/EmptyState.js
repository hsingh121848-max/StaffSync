import React from 'react';

const EmptyState = ({ title = 'No records found', description = 'There is currently no data to display.', actionButton }) => {
  return (
    <div className="text-center py-5 border rounded bg-light my-3">
      <div className="text-muted mb-2">
        <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h6 className="fw-bold text-dark">{title}</h6>
      <p className="text-muted small mb-3">{description}</p>
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
};

export default EmptyState;
