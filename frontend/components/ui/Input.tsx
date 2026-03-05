import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

const variants = {
  underline: 'bg-transparent border-b border-[#1a1a1a] py-3 focus:border-accent',
  boxed: 'bg-[#0a0a0a] border border-[#1a1a1a] px-4 py-3 focus:border-accent',
} as const;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: keyof typeof variants;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'underline', label, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="overline block mb-2">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full text-white font-sans font-light outline-none transition-colors placeholder:text-gray-600',
            variants[variant],
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
