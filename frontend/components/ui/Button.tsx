import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-white !text-black font-semibold hover:opacity-90',
  accent: 'bg-accent !text-black font-semibold hover:opacity-90',
  ghost: 'bg-transparent text-white hover:bg-white/5',
  outline: 'bg-transparent text-gray-300 border border-[#333] hover:border-[#555] hover:text-white',
  danger: 'bg-error text-white font-semibold hover:opacity-90',
} as const;

const sizes = {
  sm: 'px-4 py-2 text-body-sm',
  md: 'px-6 py-3 text-body',
  lg: 'px-8 py-4 text-body-lg',
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-sans font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
export { Button };
