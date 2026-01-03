// app/components/ui/Button.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant style
   */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  
  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Loading state
   */
  loading?: boolean;
  
  /**
   * Disabled state
   */
  disabled?: boolean;
  
  /**
   * Full width button
   */
  fullWidth?: boolean;
  
  /**
   * Icon before text
   */
  icon?: React.ReactNode;
  
  /**
   * Icon after text
   */
  iconRight?: React.ReactNode;
  
  /**
   * Loading text (when loading is true)
   */
  loadingText?: string;
  
  /**
   * Button as child component (for icons)
   */
  asChild?: boolean;
  
  /**
   * Button shape
   */
  shape?: 'default' | 'rounded' | 'pill' | 'square';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'default',
      size = 'md',
      loading = false,
      disabled = false,
      fullWidth = false,
      icon,
      iconRight,
      loadingText,
      shape = 'default',
      asChild = false,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Combined disabled state (including loading)
    const isDisabled = disabled || loading;
    
    // Base classes
    const baseClasses = cn(
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
      fullWidth && 'w-full',
      shape === 'rounded' && 'rounded-lg',
      shape === 'pill' && 'rounded-full',
      shape === 'square' && 'rounded-none',
      shape === 'default' && 'rounded-md'
    );
    
    // Size classes
    const sizeClasses = cn(
      size === 'sm' && 'h-8 px-3 text-xs',
      size === 'md' && 'h-10 px-4 text-sm',
      size === 'lg' && 'h-12 px-6 text-base',
      size === 'xl' && 'h-14 px-8 text-lg'
    );
    
    // Variant classes
    const variantClasses = cn(
      // Default variant
      variant === 'default' && 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
      
      // Destructive variant
      variant === 'destructive' && 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
      
      // Outline variant
      variant === 'outline' && 
        'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500',
      
      // Secondary variant
      variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-400',
      
      // Ghost variant
      variant === 'ghost' && 
        'text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-400',
      
      // Link variant
      variant === 'link' && 
        'text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-500 h-auto p-0'
    );
    
    // Icon size classes
    const iconSizeClasses = cn(
      size === 'sm' && 'h-3 w-3',
      size === 'md' && 'h-4 w-4',
      size === 'lg' && 'h-5 w-5',
      size === 'xl' && 'h-6 w-6'
    );

    // Compose all classes
    const composedClassName = cn(
      baseClasses,
      sizeClasses,
      variantClasses,
      variant !== 'link' && 'shadow-sm hover:shadow-md',
      loading && 'cursor-wait',
      className
    );

    // If asChild is true, clone the child element with button props
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<any>;
      return React.cloneElement(child, {
        className: cn(child.props.className, composedClassName),
        disabled: child.props.disabled !== undefined ? child.props.disabled : isDisabled,
        ...props,
        ref: child.props.ref || ref,
      });
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={composedClassName}
        {...props}
      >
        {/* Loading state */}
        {loading && (
          <Loader2 className={cn('animate-spin', iconSizeClasses, children && 'mr-2')} />
        )}
        
        {/* Icon (only show when not loading or loadingText is provided) */}
        {!loading && icon && (
          <span className={cn(iconSizeClasses, children && 'mr-2')}>
            {icon}
          </span>
        )}
        
        {/* Button text */}
        <span className="truncate">
          {loading && loadingText ? loadingText : children}
        </span>
        
        {/* Right icon (only show when not loading) */}
        {!loading && iconRight && (
          <span className={cn(iconSizeClasses, children && 'ml-2')}>
            {iconRight}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };