import React, { useEffect, useState } from 'react';
import { getFileFromIDB } from '../lib/idb';

interface EBookCoverProps {
  coverUrl: string;
  alt: string;
  className?: string;
}

export const EBookCover: React.FC<EBookCoverProps> = ({ coverUrl, alt, className }) => {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    if (coverUrl && !coverUrl.startsWith('idb://')) return coverUrl;
    return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=800&fit=crop';
  });

  useEffect(() => {
    let active = true;
    if (coverUrl && coverUrl.startsWith('idb://')) {
      const key = coverUrl.replace('idb://', '');
      getFileFromIDB(key).then((res) => {
        if (active && res) {
          setImgSrc(res);
        }
      });
    } else if (coverUrl) {
      setImgSrc(coverUrl);
    }
    return () => {
      active = false;
    };
  }, [coverUrl]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={(e) => {
        e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=800&fit=crop';
      }}
      className={className}
    />
  );
};
