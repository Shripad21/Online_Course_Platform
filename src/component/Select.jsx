import React, { useId } from 'react';

function Select({ options, label, className = '', ...props }, ref) {
  const id = useId();
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1 text-gray-700" htmlFor={id}>
          {label}
        </label>
      )}
      <select
        id={id}
        {...props}
        ref={ref}
        className={`px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-300 w-full ${className}`}
      >
        {options?.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default React.forwardRef(Select);
