import { cn } from '@/lib/utils';

const sizes = {
  sm: 'text-heading-sm',
  md: 'text-heading-lg',
  lg: 'text-display-sm',
  xl: 'text-display-lg',
} as const;

interface LogoProps {
  size?: keyof typeof sizes;
  className?: string;
}

export default function Logo({ size = 'md', className }: LogoProps) {
  return (
    <span
      className={cn(
        'font-display tracking-wide',
        sizes[size],
        className
      )}
    >
      IMPERIUM
    </span>
  );
}
