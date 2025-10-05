// "use client";

// export default function DynamicOptions({ config = [], options = {}, setOptions }) {
//   const handleChange = (key, value) => {
//     setOptions({
//       ...options,
//       [key]: value,
//     });
//   };
//   console.log('in dynamic options', config, options )

//   return (
//     <div className="space-y-4">
//       {config.map((item) => (
//         <div key={item.key} className="border p-3 rounded">
//           <label className="block font-medium mb-2">{item.label}</label>

//           {/* RADIO GROUP */}
//           {item.type === "radio" && item.options ? (
//             <div className="space-y-1">
//               {item.options.map((option) => (
//                 <label key={option} className="flex items-center space-x-2">
//                   <input
//                     type="radio"
//                     name={item.key}
//                     value={option}
//                     checked={options[item.key] === option}
//                     onChange={() => handleChange(item.key, option)}
//                   />
//                   <span>{option}</span>
//                 </label>
//               ))}
//             </div>
//           ) : (
//             // CHECKBOX for anything else (boolean feature)
//             <label className="flex items-center space-x-2">
//               <input
//                 type="checkbox"
//                 checked={!!options[item.key]}
//                 onChange={(e) => handleChange(item.key, e.target.checked)}
//               />
//               <span>{item.label}</span>
//             </label>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }


// "use client";

// export default function DynamicOptions({ config = [], options = {}, setOptions }) {
//   const handleChange = (key, value) => {
//     setOptions({
//       ...options,
//       [key]: value,
//     });
//   };
//   console.log('in dynamic options', config, options )

//   return (
//     <div className="space-y-4">
//       {config.map((item) => (
//         <div key={item.key} className="border p-3 rounded">
//           <label className="block font-medium mb-2">{item.label}</label>

//           {/* RADIO GROUP */}
//           {item.type === "radio" && item.options ? (
//             <div className="space-y-1">
//               {item.options.map((option) => (
//                 <label key={option} className="flex items-center space-x-2">
//                   <input
//                     type="radio"
//                     name={item.key}
//                     value={option}
//                     checked={options[item.key] === option}
//                     onChange={() => handleChange(item.key, option)}
//                   />
//                   <span>{option}</span>
//                 </label>
//               ))}
//             </div>
//           ) : (
//             // CHECKBOX for anything else (boolean feature)
//             <label className="flex items-center space-x-2">
//               <input
//                 type="checkbox"
//                 checked={!!options[item.key]}
//                 onChange={(e) => handleChange(item.key, e.target.checked)}
//               />
//               <span>{item.label}</span>
//             </label>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }




"use client";

export default function DynamicOptions({ config = [], options = {}, setOptions }) {
  const handleChange = (key, value) => {
    setOptions({
      ...options,
      [key]: value,
    });
  };

  console.log('in dynamic options', config, options);

  const renderInputField = (item) => {
    const currentValue = options[item.key];

    switch (item.type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-700 dark:text-gray-200">
                {item.label}
                {item.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {item.category && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
              )}
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentValue ?? item.defaultValue ?? false}
                onChange={(e) => handleChange(item.key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        );

      case 'select':
      case 'dropdown':
        return (
          <div className="space-y-2">
            <label className="block font-medium text-gray-700 dark:text-gray-200">
              {item.label}
              {item.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {item.category && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
            )}
            <select
              value={currentValue ?? item.defaultValue ?? ''}
              onChange={(e) => handleChange(item.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select {item.label}</option>
              {item.options?.map((option, index) => {
                const value = typeof option === 'string' ? option : option.value;
                const label = typeof option === 'string' ? option : option.label;
                return (
                  <option key={index} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            <label className="block font-medium text-gray-700 dark:text-gray-200">
              {item.label}
              {item.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {item.category && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
            )}
            <div className="space-y-2">
              {item.options?.map((option, index) => {
                const value = typeof option === 'string' ? option : option.value;
                const label = typeof option === 'string' ? option : option.label;
                return (
                  <label key={index} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={item.key}
                      value={value}
                      checked={currentValue === value}
                      onChange={() => handleChange(item.key, value)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );

      case 'text':
      case 'number':
      case 'textarea':
        const inputProps = {
          value: currentValue ?? item.defaultValue ?? '',
          onChange: (e) => {
            const value = item.type === 'number' ? parseFloat(e.target.value) || '' : e.target.value;
            handleChange(item.key, value);
          },
          className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500",
          placeholder: item.placeholder || `Enter ${item.label}`,
        };

        if (item.type === 'number') {
          inputProps.type = 'number';
          inputProps.min = item.min;
          inputProps.max = item.max;
          inputProps.step = item.step || 'any';
        }

        if (item.maxLength) {
          inputProps.maxLength = item.maxLength;
        }

        return (
          <div className="space-y-2">
            <label className="block font-medium text-gray-700 dark:text-gray-200">
              {item.label}
              {item.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {item.category && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
            )}
            {item.type === 'textarea' ? (
              <textarea {...inputProps} rows={item.rows || 3} />
            ) : (
              <input {...inputProps} type={item.type === 'number' ? 'number' : 'text'} />
            )}
          </div>
        );

      default:
        // Fallback for backward compatibility
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!currentValue}
              onChange={(e) => handleChange(item.key, e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
          </label>
        );
    }
  };

  return (
    <div className="space-y-4">
      {config.map((item) => (
        <div 
          key={item.key} 
          className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
        >
          {renderInputField(item)}
        </div>
      ))}
    </div>
  );
}
