// src/ui/Card.jsx
import React from "react";

/**
 * Mock Card component and sub-components (simplified shadcn/ui).
 */
export const Card = ({ children, className = "", ...props }) => (
  <div
    className={`rounded-xl border border-gray-200 bg-white text-gray-900 shadow dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className = "", ...props }) => (
  <div
    // Adjusted default padding
    className={`flex flex-col space-y-1.5 p-4 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle = ({
  children,
  className = "",
  as = "h3",
  ...props
}) => {
  const Tag = as;
  return (
    <Tag
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
};

export const CardDescription = ({ children, className = "", ...props }) => (
  <p
    className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}
    {...props}
  >
    {children}
  </p>
);

export const CardContent = ({ children, className = "", ...props }) => (
  // Adjusted default padding (removed pt-0)
  <div className={`p-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = "", ...props }) => (
  // Adjusted default padding (removed pt-0)
  <div className={`flex items-center p-4 ${className}`} {...props}>
    {children}
  </div>
);

// You might choose to export Card as default if it's the main export
// export default Card;
