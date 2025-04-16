// src/ui/Dialog.jsx
import React from "react";

/**
 * Mock Dialog component and sub-components (simplified shadcn/ui).
 */
export const Dialog = ({ open, onClose, children }) => {
  if (!open) return null;

  // Handle Escape key press to close dialog
  React.useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose} // Close on overlay click
      role="dialog"
      aria-modal="true"
    >
      {/* Dialog Container */}
      <div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-lg mx-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside dialog
      >
        {/* Pass onClose to children if needed, e.g., for a close button inside */}
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            // Example: Inject onClose prop into DialogContent if needed
            // if (child.type === DialogContent) {
            //     return React.cloneElement(child, { onClose });
            // }
          }
          return child;
        })}
      </div>
    </div>
  );
};

export const DialogContent = ({ children, className = "", ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const DialogHeader = ({ children, className = "", ...props }) => (
  <div
    // Added flex layout for potential close button alignment
    className={`relative flex flex-col space-y-1.5 text-center sm:text-left border-b border-gray-200 dark:border-gray-800 pb-4 mb-4 ${className}`}
    {...props}
  >
    {children}
    {/* Example: Close button could be added here or passed via children */}
    {/* <button onClick={onClose} className="absolute top-4 right-4 ...">X</button> */}
  </div>
);

export const DialogTitle = ({
  children,
  className = "",
  as = "h2",
  ...props
}) => {
  const Tag = as;
  return (
    <Tag
      className={`text-xl font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-100 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
};

export const DialogDescription = ({ children, className = "", ...props }) => (
  <p
    className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}
    {...props}
  >
    {children}
  </p>
);

export const DialogFooter = ({ children, className = "", ...props }) => (
  <div
    className={`mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0 border-t border-gray-200 dark:border-gray-800 pt-4 ${className}`}
    {...props}
  >
    {children}
  </div>
);

// export default Dialog;
