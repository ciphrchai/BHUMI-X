
export interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  displayValue?: string;
  className?: string;
}

export default function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  displayValue,
  className = ''
}: SliderProps) {
  
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-[#2563eb]">
          {displayValue || value}
        </span>
      </div>
      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-1 z-10 opacity-0"
          style={{ position: 'absolute' }}
        />
        <div className="w-full h-2 bg-gray-200 rounded-lg overflow-hidden pointer-events-none">
          <div 
            className="h-full bg-[#3b82f6] rounded-lg" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Custom thumb to show above background track */}
        <div 
          className="w-4 h-4 bg-white border-2 border-[#3b82f6] rounded-full absolute pointer-events-none shadow-sm"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  );
}
