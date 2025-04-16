// src/ui/RadioGroup.jsx
import React from "react";

/**
 * Mock RadioGroup component and sub-components (simplified shadcn/ui).
 * Manages checked state based on parent value prop.
 */
export const RadioGroup = ({
  children,
  className = "",
  value,
  onValueChange,
  ...props
}) => {
  return (
    <div role="radiogroup" className={`grid gap-2 ${className}`} {...props}>
      {/* Clone children to pass down checked state and unified onChange */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === RadioGroupItem) {
          return React.cloneElement(child, {
            checked: child.props.value === value,
            // Ensure onChange calls the parent's onValueChange with the item's value
            onChange: () => onValueChange(child.props.value),
          });
        }
        // Render non-RadioGroupItem children as is (e.g., labels within divs)
        return child;
      })}
    </div>
  );
};

export const RadioGroupItem = React.forwardRef(
  (
    {
      className = "",
      value, // value is essential for the parent RadioGroup logic
      checked, // This will be controlled by the parent RadioGroup
      onChange, // This will be controlled by the parent RadioGroup
      ...props
    },
    ref
  ) => {
    return (
      <input
        ref={ref}
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
        className={`h-4 w-4 accent-blue-600 dark:accent-blue-500 border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 ${className}`}
        {...props}
      />
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

// export default RadioGroup;
