/**
 * Button Component
 *
 * Reusable button with consistent styling and variants.
 * Supports primary (green), secondary (outline), and danger (red) variants.
 */

import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-lg font-bold uppercase text-sm tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-green-500 hover:bg-green-400 text-black',
    secondary: 'border-2 border-gray-600 hover:border-gray-500 text-white bg-transparent',
    danger: 'bg-red-500 hover:bg-red-400 text-white'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
