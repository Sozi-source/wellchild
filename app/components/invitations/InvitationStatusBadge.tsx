'use client';

import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface InvitationStatusBadgeProps {
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  size?: 'sm' | 'md';
}

export default function InvitationStatusBadge({ status, size = 'md' }: InvitationStatusBadgeProps) {
  const config = {
    pending: {
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      label: 'Pending',
    },
    accepted: {
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800 border-green-200',
      label: 'Accepted',
    },
    rejected: {
      icon: XCircle,
      color: 'bg-red-100 text-red-800 border-red-200',
      label: 'Rejected',
    },
    expired: {
      icon: AlertCircle,
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      label: 'Expired',
    },
  };

  const { icon: Icon, color, label } = config[status];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center rounded-full border ${color} ${sizeClass}`}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </span>
  );
}