// src/ui/Label.jsx
import React from "react";

export const Label = React.forwardRef(
  ({ className = "", children, htmlFor, ...props }, ref) => (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}
      ref={ref}
      {...props}
    >
      {children}
    </label>
  )
);
Label.displayName = "Label";
