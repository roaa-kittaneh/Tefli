import React from 'react';

interface ChildAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const GRADIENTS = [
  'from-[#7B9669] to-[#6C8480]',
  'from-[#6C8480] to-[#404E3B]',
  'from-[#404E3B] to-[#7B9669]',
  'from-[#BAC8B1] to-[#6C8480]',
];

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  // For Arabic names: take first char of first and last word
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const sizeMap = {
  sm:  { container: 'w-6 h-6',  text: 'text-[9px]' },
  md:  { container: 'w-9 h-9',  text: 'text-xs'    },
  lg:  { container: 'w-14 h-14', text: 'text-lg'   },
  xl:  { container: 'w-24 h-24', text: 'text-3xl'  },
};

export const ChildAvatar: React.FC<ChildAvatarProps> = ({ name, size = 'md', className = '' }) => {
  const { container, text } = sizeMap[size];
  const gradient = getGradient(name);
  const initials = getInitials(name);

  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center flex-shrink-0 shadow-sm select-none ${container} ${className}`}
    >
      <span className={`text-white font-bold leading-none ${text}`}>{initials}</span>
    </div>
  );
};
