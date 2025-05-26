// src/ui/RadioGroup.jsx
import React from "react";

// Forward ref for RadioGroupItem is good.
export const RadioGroupItem = React.forwardRef(
  (
    {
      className = "",
      value,
      checked,
      onChange,
      name, // Receive name prop
      id,
      ...props
    },
    ref
  ) => {
    return (
      <input
        ref={ref}
        type="radio"
        id={id}
        name={name} // Use the name for native grouping
        value={value} // HTML value attribute
        checked={checked} // Controlled component checked state
        onChange={onChange} // Controlled component onChange handler
        className={`h-4 w-4 accent-indigo-600 dark:accent-indigo-500 border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 ${className}`}
        {...props}
      />
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export const RadioGroup = ({ children, className = "", value, onValueChange, name: groupName, ...props }) => {
  const processChild = (child) => {
    if (!React.isValidElement(child)) {
      return child;
    }

    // If the child is a RadioGroupItem directly
    if (child.type === RadioGroupItem) {
      return React.cloneElement(child, {
        checked: child.props.value === value,
        onChange: () => {
          if (onValueChange) {
            onValueChange(child.props.value);
          }
        },
        name: groupName,
      });
    }

    // If the child has its own children, recursively process them
    // This is to handle cases where RadioGroupItem might be wrapped (e.g., in a Label)
    if (child.props && child.props.children) {
      const newChildProps = {
        ...child.props,
        children: React.Children.map(child.props.children, processChild),
      };
      return React.cloneElement(child, newChildProps);
    }

    return child;
  };

  return (
    <div role="radiogroup" className={`flex items-center gap-x-4 gap-y-2 ${className}`} {...props}>
      {React.Children.map(children, processChild)}
    </div>
  );
};
