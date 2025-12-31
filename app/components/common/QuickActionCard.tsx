// app/components/common/QuickActionCard.tsx
import React from 'react';
import { Card, CardContent } from '@/app/components/ui/Card';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function QuickActionCard({
  title,
  description,
  icon,
  onClick,
  className = ''
}: QuickActionCardProps) {
  return (
    <Card
      className={`hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="text-2xl">{icon}</div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}