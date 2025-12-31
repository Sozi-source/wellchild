interface WHOBadgeProps {
  zScore: number;
  classification: string;
  type?: 'weight' | 'height' | 'bmi';
  showZScore?: boolean;
}

export default function WHOBadge({ zScore, classification, type, showZScore = true }: WHOBadgeProps) {
  const getColorClasses = () => {
    if (zScore < -2) return 'bg-red-100 text-red-800 border-red-200';
    if (zScore < 2) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getIcon = () => {
    if (zScore < -2) return '⚠️';
    if (zScore < 2) return '✓';
    return '⚠️';
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${getColorClasses()}`}>
      <span>{getIcon()}</span>
      <span className="font-medium">{classification}</span>
      {showZScore && (
        <span className="text-xs opacity-75">Z: {zScore.toFixed(2)}</span>
      )}
      {type && (
        <span className="text-xs px-2 py-0.5 bg-white/50 rounded">
          {type}
        </span>
      )}
    </div>
  );
}