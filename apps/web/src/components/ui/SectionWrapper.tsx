import { ReactNode } from 'react';

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'dark' | 'light';
}

export default function SectionWrapper({ 
  children, 
  className = '',
  variant = 'default'
}: SectionWrapperProps) {
  const variants = {
    default: 'bg-white',
    dark: 'bg-gray-900 text-white',
    light: 'bg-gray-50'
  };

  return (
    <section className={`py-16 px-6 ${variants[variant]} ${className}`}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </section>
  );
}
