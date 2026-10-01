import React from 'react';

interface BtsCoverArtProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  imageUrl?: string;
  alt?: string;
}

export const BtsCoverArt: React.FC<BtsCoverArtProps> = ({
  className = '',
  imageUrl = '/bts-poster-square.jpg',
  alt = 'BTS WORLD TOUR ARIRANG',
}) => {
  return (
    <div
      className={`relative overflow-hidden bg-[#EAEAEA] flex items-center justify-center select-none ${className}`}
      style={{ aspectRatio: '1/1' }}
    >
      <img
        src={imageUrl || '/bts-poster-square.jpg'}
        alt={alt}
        className="w-full h-full object-cover object-center select-none pointer-events-none block"
        referrerPolicy="no-referrer"
        loading="eager"
      />
    </div>
  );
};

