
export interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px] w-full">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-[#3b82f6] rounded-full animate-spin mb-4"></div>
      {message && <p className="text-gray-500 text-sm font-medium">{message}</p>}
    </div>
  );
}
