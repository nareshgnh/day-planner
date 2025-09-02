// src/ui/Button.jsx
import React from "react";

/**
 * Mock Button component (simplified shadcn/ui).
 */
export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  block = false,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-[var(--radius-sm)] text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:focus-ring";
  const variants = {
    primary:
      "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-600)]",
    secondary:
      "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-elevated)]",
    outline:
      "border border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface)]",
    ghost:
      "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface)]",
    destructive:
      "bg-[var(--color-danger)] text-white hover:bg-[#d12f2f]",
    soft:
      "bg-[color-mix(in_oKlab,var(--color-primary)_18%,transparent)] text-[var(--color-text)] hover:bg-[color-mix(in_oKlab,var(--color-primary)_28%,transparent)]",
    link:
      "text-[var(--color-primary)] hover:underline bg-transparent",
  };
  const sizes = {
    xs: "h-8 px-3 text-xs",
    sm: "h-9 px-3",
    md: "h-10 px-4",
    lg: "h-11 px-5",
    icon: "h-10 w-10",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${block ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Export as default if this is the primary export of the file
// export default Button;
