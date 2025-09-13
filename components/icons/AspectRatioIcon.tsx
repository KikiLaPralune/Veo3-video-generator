
import React from 'react';
import { AspectRatio } from '../../types';

interface AspectRatioIconProps {
  ratio: AspectRatio;
  className?: string;
}

export const AspectRatioIcon: React.FC<AspectRatioIconProps> = ({ ratio, className = "w-6 h-6" }) => {
  const baseClasses = "stroke-current stroke-2 fill-none";
  switch (ratio) {
    case '16:9':
      return <svg viewBox="0 0 32 18" className={className}><rect x="0" y="0" width="32" height="18" rx="2" className={baseClasses}/></svg>;
    case '9:16':
      return <svg viewBox="0 0 18 32" className={className}><rect x="0" y="0" width="18" height="32" rx="2" className={baseClasses}/></svg>;
    case '1:1':
      return <svg viewBox="0 0 24 24" className={className}><rect x="0" y="0" width="24" height="24" rx="2" className={baseClasses}/></svg>;
    case '4:3':
        return <svg viewBox="0 0 24 18" className={className}><rect x="0" y="0" width="24" height="18" rx="2" className={baseClasses}/></svg>;
    case '3:4':
        return <svg viewBox="0 0 18 24" className={className}><rect x="0" y="0" width="18" height="24" rx="2" className={baseClasses}/></svg>;
    default:
      return null;
  }
};
