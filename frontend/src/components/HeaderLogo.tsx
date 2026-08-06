import React from 'react';

export const HeaderLogo: React.FC = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '0 0 20px 0', width: '100%' }}>
      <img
        src="/assets/apparel-logo.png"
        alt="Apparel Group Logo"
        style={{
          width: '140px',
          maxHeight: '50px',
          objectFit: 'contain'
        }}
      />
    </div>
  );
};
