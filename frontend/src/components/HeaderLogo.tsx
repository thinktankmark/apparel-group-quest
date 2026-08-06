import React from 'react';

interface HeaderLogoProps {
  sequenceOrder?: number;
  brandLogoUrl?: string;
}

export const HeaderLogo: React.FC<HeaderLogoProps> = ({ sequenceOrder = 1, brandLogoUrl }) => {
  const getBrandLogo = () => {
    if (brandLogoUrl) return brandLogoUrl;
    if (sequenceOrder === 1) return '/assets/skechers-logo.png';
    if (sequenceOrder === 2) return '/assets/aco-logo.png';
    if (sequenceOrder === 3) return '/assets/polo-logo.png';
    if (sequenceOrder === 4) return '/assets/steve-madden-logo.png';
    return '/assets/skechers-logo.png';
  };

  const logoUrl = getBrandLogo();

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
      <img
        src="/assets/apparel-logo.png"
        alt="Apparel Group Logo"
        style={{ width: '110px', height: 'auto', objectFit: 'contain' }}
      />
      <img
        src={logoUrl}
        alt="Brand Logo"
        style={{ width: '110px', height: 'auto', objectFit: 'contain' }}
      />
    </div>
  );
};
