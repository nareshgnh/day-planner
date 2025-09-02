// src/ui/Input.jsx
import React from "react";

/**
 * Mock Input component (simplified shadcn/ui).
 */
export const Input = React.forwardRef(
  ({ className = "", type = "text", ...props }, ref) => (
    <input
      type={type}
      className={`flex h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input"; // Important for DevTools

// Export as default if this is the primary export of the file
// export default Input;
