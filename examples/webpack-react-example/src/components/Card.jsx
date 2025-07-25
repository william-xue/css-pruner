import React from 'react';

function Card({ children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

export default Card;