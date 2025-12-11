'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'btn-primary text-white shadow-lg hover:shadow-xl': variant === 'primary',
            'bg-white text-primary-700 border-2 border-primary-200 hover:border-primary-400 hover:bg-primary-50': variant === 'secondary',
            'border-2 border-slate-300 text-slate-700 hover:border-primary-400 hover:text-primary-600 bg-transparent': variant === 'outline',
            'text-slate-600 hover:text-primary-600 hover:bg-primary-50 bg-transparent': variant === 'ghost',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-5 py-2.5 text-base': size === 'md',
            'px-7 py-3.5 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };

