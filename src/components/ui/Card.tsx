
export interface CardProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({ children, className = '', padding = 'md', onClick }: CardProps) {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-8"
  };

  return (
    <div onClick={onClick} className={`bg-white border border-gray-200 rounded-xl shadow-sm ${paddings[padding]} ${className}`}>
      {children}
    </div>
  );
}
