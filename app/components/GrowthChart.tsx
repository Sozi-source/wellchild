'use client';

interface ChartDataPoint {
  date: string;
  ageMonths: number;
  value: number;
  zScore: number;
}

interface GrowthChartProps {
  title: string;
  unit: string;
  data: ChartDataPoint[];
  color?: string;
}

export default function GrowthChart({ title, unit, data, color = 'blue' }: GrowthChartProps) {
  const getColorClasses = () => {
    switch(color) {
      case 'blue': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'green': return 'bg-green-50 border-green-200 text-green-800';
      case 'purple': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (data.length === 0) {
    return (
      <div className={`border rounded-lg p-4 ${getColorClasses()}`}>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm opacity-75">No measurements yet</p>
      </div>
    );
  }

  const latest = data[0];
  
  return (
    <div className={`border rounded-lg p-4 ${getColorClasses()}`}>
      <h3 className="font-semibold mb-3">{title}</h3>
      
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-2xl font-bold">{latest.value.toFixed(1)} {unit}</div>
            <div className="text-sm opacity-75">
              Age: {latest.ageMonths.toFixed(1)} months
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-medium">Z: {latest.zScore.toFixed(2)}</div>
            <div className="text-sm opacity-75">
              {data.length} measurement{data.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
      
      {/* Simple progress bar for Z-score visualization */}
      <div className="h-2 bg-white/50 rounded-full overflow-hidden">
        <div 
          className={`h-full ${
            Math.abs(latest.zScore) > 2 ? 'bg-red-500' : 
            Math.abs(latest.zScore) > 1 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ 
            width: `${Math.min(100, Math.abs(latest.zScore) * 25)}%`,
            marginLeft: latest.zScore > 0 ? '50%' : `${50 - Math.min(50, Math.abs(latest.zScore) * 25)}%`
          }}
        />
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span>-3 SD</span>
        <span>Mean</span>
        <span>+3 SD</span>
      </div>
    </div>
  );
}