/**
 * Input Component
 *
 * Reusable form input with consistent styling.
 * Supports text, date, time, and number input types.
 */

import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold uppercase text-gray-400 tracking-wide">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors ${className}`}
        {...props}
      />
    </div>
  );
}
