import React from 'react';

function Button({ children, onClick, variant = 'primary', disabled = false }) {
  const className = `btn btn-${variant} ${disabled ? 'btn-disabled' : ''}`;
  
  return (
    <button 
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;