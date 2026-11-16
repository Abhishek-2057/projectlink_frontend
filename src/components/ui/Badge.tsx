import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-slate-900 text-white',
        emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold',
        secondary: 'border-transparent bg-slate-100 text-slate-900',
        destructive: 'border-red-200 bg-red-50 text-red-700 font-medium',
        warning: 'border-amber-200 bg-amber-50 text-amber-800 font-medium',
        info: 'border-blue-200 bg-blue-50 text-blue-800 font-medium',
        outline: 'border-slate-300 text-slate-700 bg-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
