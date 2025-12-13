import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="floating-input-group">
                <input
                    ref={ref}
                    className={`floating-input ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
                    placeholder=" "
                    {...props}
                />
                <label className="floating-label">
                    {label}
                </label>
                {error && (
                    <p className="mt-1 text-sm text-red-400">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
