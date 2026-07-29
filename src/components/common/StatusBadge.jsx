import React from 'react';
import { translateStatus, getStatusColors } from '../../utils/arabicLocalization';

/**
 * StatusBadge — Reusable Arabic status badge with auto-coloring
 *
 * Props:
 *  - status: raw English status string (e.g. "Pending", "Approved")
 *  - label: override Arabic label (optional)
 *  - showDot: show colored dot indicator (default: true)
 *  - size: 'sm' | 'md' (default: 'sm')
 *  - className: extra classes
 */
const StatusBadge = React.memo(({ status, label, showDot = true, size = 'sm', className = '' }) => {
  const arabicLabel = label || translateStatus(status);
  const colors = getStatusColors(status);

  const sizeClasses = size === 'md'
    ? 'px-3 py-1 text-xs'
    : 'px-2.5 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full border ${sizeClasses} ${colors.bg} ${colors.text} ${colors.border} ${className}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot}`} />
      )}
      {arabicLabel}
    </span>
  );
});

export default StatusBadge;
