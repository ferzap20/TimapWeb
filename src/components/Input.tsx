/**
 * Input Component
 *
 * Reusable form input with consistent styling.
 * Supports text, date, time, and number input types.
 * Optional left icon support for enhanced visual feedback.
 */

import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: ReactNode;
}

export function Input({ label, leftIcon, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold uppercase text-gray-400 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          className={`w-full ${leftIcon ? 'pl-12' : 'pl-4'} pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}
