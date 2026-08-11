
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  suffix?: string;
  error?: string;
}

export default function Input({ label, suffix, error, className = '', ...props }: InputProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        <input
          className={`w-full bg-white border ${
            error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#3b82f6]'
          } rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${
            suffix ? 'pr-12' : ''
          }`}
          {...props}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{suffix}</span>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
