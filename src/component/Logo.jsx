import React from 'react';

function Logo({ width = '100px', logoPath}) {
  return (
    <div style={{ width }}>
      { logoPath ? (
        <img src={logoPath} alt="Logo" style={{ width: '100%', height: 'auto' }} />
      ) : (
        <p>Logo</p>
      )}
    </div>
  );
}

export default Logo;