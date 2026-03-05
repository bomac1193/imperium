import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8', className)}>
      <div>
        <h1 className="font-display text-display-sm">{title}</h1>
        {description && (
          <p className="text-gray-400 mt-1 font-light">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-4">{actions}</div>}
    </div>
  );
}
