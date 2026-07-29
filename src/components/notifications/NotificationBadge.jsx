import React from 'react';

const NotificationBadge = ({ count, className = '' }) => {
  if (!count || count <= 0) return null;
  return (
    <span className={`absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-black rounded-full ring-2 ring-white dark:ring-slate-900 flex items-center justify-center animate-bounce-subtle ${className}`}>
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default NotificationBadge;
