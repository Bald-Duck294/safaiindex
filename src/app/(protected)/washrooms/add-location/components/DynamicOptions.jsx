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




// "use client";

// export default function DynamicOptions({ config = [], options = {}, setOptions }) {
//   const handleChange = (key, value) => {
//     setOptions({
//       ...options,
//       [key]: value,
//     });
//   };

//   console.log('in dynamic options', config, options);

//   const renderInputField = (item) => {
//     const currentValue = options[item.key];

//     switch (item.type) {
//       case 'boolean':
//         return (
//           <div className="flex items-center justify-between">
//             <div>
//               <label className="font-medium text-gray-700 ">
//                 {item.label}
//                 {item.required && <span className="text-red-500 ml-1">*</span>}
//               </label>
//               {item.category && (
//                 <p className="text-sm text-gray-500 ">{item.category}</p>
//               )}
//             </div>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={currentValue ?? item.defaultValue ?? false}
//                 onChange={(e) => handleChange(item.key, e.target.checked)}
//                 className="sr-only peer"
//               />
//               <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300  rounded-full peer  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
//             </label>
//           </div>
//         );

//       case 'select':
//       case 'dropdown':
//         return (
//           <div className="space-y-2">
//             <label className="block font-medium text-gray-700 ">
//               {item.label}
//               {item.required && <span className="text-red-500 ml-1">*</span>}
//             </label>
//             {item.category && (
//               <p className="text-sm text-gray-500 ">{item.category}</p>
//             )}
//             <select
//               value={currentValue ?? item.defaultValue ?? ''}
//               onChange={(e) => handleChange(item.key, e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300  rounded-lg bg-white  text-gray-700  focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">Select {item.label}</option>
//               {item.options?.map((option, index) => {
//                 const value = typeof option === 'string' ? option : option.value;
//                 const label = typeof option === 'string' ? option : option.label;
//                 return (
//                   <option key={index} value={value}>
//                     {label}
//                   </option>
//                 );
//               })}
//             </select>
//           </div>
//         );

//       case 'radio':
//         return (
//           <div className="space-y-2">
//             <label className="block font-medium text-gray-700 ">
//               {item.label}
//               {item.required && <span className="text-red-500 ml-1">*</span>}
//             </label>
//             {item.category && (
//               <p className="text-sm text-gray-500 ">{item.category}</p>
//             )}
//             <div className="space-y-2">
//               {item.options?.map((option, index) => {
//                 const value = typeof option === 'string' ? option : option.value;
//                 const label = typeof option === 'string' ? option : option.label;
//                 return (
//                   <label key={index} className="flex items-center space-x-2">
//                     <input
//                       type="radio"
//                       name={item.key}
//                       value={value}
//                       checked={currentValue === value}
//                       onChange={() => handleChange(item.key, value)}
//                       className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
//                     />
//                     <span className="text-gray-700 ">{label}</span>
//                   </label>
//                 );
//               })}
//             </div>
//           </div>
//         );

//       case 'text':
//       case 'number':
//       case 'textarea':
//         const inputProps = {
//           value: currentValue ?? item.defaultValue ?? '',
//           onChange: (e) => {
//             const value = item.type === 'number' ? parseFloat(e.target.value) || '' : e.target.value;
//             handleChange(item.key, value);
//           },
//           className: "w-full px-3 py-2 border border-gray-300  rounded-lg bg-white  text-gray-700  focus:outline-none focus:ring-2 focus:ring-blue-500",
//           placeholder: item.placeholder || `Enter ${item.label}`,
//         };

//         if (item.type === 'number') {
//           inputProps.type = 'number';
//           inputProps.min = item.min;
//           inputProps.max = item.max;
//           inputProps.step = item.step || 'any';
//         }

//         if (item.maxLength) {
//           inputProps.maxLength = item.maxLength;
//         }

//         return (
//           <div className="space-y-2">
//             <label className="block font-medium text-gray-700 ">
//               {item.label}
//               {item.required && <span className="text-red-500 ml-1">*</span>}
//             </label>
//             {item.category && (
//               <p className="text-sm text-gray-500 ">{item.category}</p>
//             )}
//             {item.type === 'textarea' ? (
//               <textarea {...inputProps} rows={item.rows || 3} />
//             ) : (
//               <input {...inputProps} type={item.type === 'number' ? 'number' : 'text'} />
//             )}
//           </div>
//         );

//       default:
//         // Fallback for backward compatibility
//         return (
//           <label className="flex items-center space-x-2">
//             <input
//               type="checkbox"
//               checked={!!currentValue}
//               onChange={(e) => handleChange(item.key, e.target.checked)}
//               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
//             />
//             <span className="text-gray-700 ">{item.label}</span>
//           </label>
//         );
//     }
//   };

//   return (
//     <div className="space-y-4">
//       {config.map((item) => (
//         <div 
//           key={item.key} 
//           className="p-3 bg-gray-50  rounded-lg"
//         >
//           {renderInputField(item)}
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

  // ✅ Handle multiselect changes
  const handleMultiselectChange = (key, value, checked) => {
    const currentValues = options[key] || [];
    let newValues;
    
    if (checked) {
      // Add value if not already present
      newValues = currentValues.includes(value) 
        ? currentValues 
        : [...currentValues, value];
    } else {
      // Remove value
      newValues = currentValues.filter(v => v !== value);
    }
    
    handleChange(key, newValues);
  };

  console.log('in dynamic options', config, options);

  const renderInputField = (item) => {
    const currentValue = options[item.key];

    switch (item.type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-gray-700 ">
                {item.label}
                {item.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {item.category && (
                <p className="text-sm text-gray-500 ">{item.category}</p>
              )}
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentValue ?? item.defaultValue ?? false}
                onChange={(e) => handleChange(item.key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300  rounded-full peer  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
            </label>
          </div>
        );

      // ✅ New multiselect case
      case 'multiselect':
        const selectedValues = currentValue || item.defaultValue || [];
        return (
          <div className="space-y-3">
            <label className="block font-medium text-gray-700 ">
              {item.label}
              {item.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {item.category && (
              <p className="text-sm text-gray-500 ">{item.category}</p>
            )}
            
            {/* Selected count indicator */}
            {selectedValues.length > 0 && (
              <div className="text-sm text-blue-600  font-medium">
                {selectedValues.length} selected
              </div>
            )}

            {/* Options grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {item.options?.map((option, index) => {
                const value = typeof option === 'string' ? option : option.value;
                const label = typeof option === 'string' ? option : option.label;
                const isSelected = selectedValues.includes(value);
                
                return (
                  <label 
                    key={index} 
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-200  ' 
                        : 'bg-white border-gray-200 hover:bg-gray-50   '
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleMultiselectChange(item.key, value, e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500  "
                    />
                    <span className={`text-sm font-medium ${
                      isSelected 
                        ? 'text-blue-700 ' 
                        : 'text-gray-700 '
                    }`}>
                      {label}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Selected values display (optional) */}
            {selectedValues.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedValues.map((value) => {
                  const option = item.options?.find(opt => 
                    (typeof opt === 'string' ? opt : opt.value) === value
                  );
                  const label = option ? 
                    (typeof option === 'string' ? option : option.label) : 
                    value;
                  
                  return (
                    <span 
                      key={value}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full  "
                    >
                      {label}
                      <button
                        type="button"
                        onClick={() => handleMultiselectChange(item.key, value, false)}
                        className="ml-1 text-blue-600 hover:text-blue-800  "
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'select':
      case 'dropdown':
        return (
          <div className="space-y-2">
            <label className="block font-medium text-gray-700 ">
              {item.label}
              {item.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {item.category && (
              <p className="text-sm text-gray-500 ">{item.category}</p>
            )}
            <select
              value={currentValue ?? item.defaultValue ?? ''}
              onChange={(e) => handleChange(item.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300  rounded-lg bg-white  text-gray-700  focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block font-medium text-gray-700 ">
              {item.label}
              {item.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {item.category && (
              <p className="text-sm text-gray-500 ">{item.category}</p>
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
                    <span className="text-gray-700 ">{label}</span>
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
          className: "w-full px-3 py-2 border border-gray-300  rounded-lg bg-white  text-gray-700  focus:outline-none focus:ring-2 focus:ring-blue-500",
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
            <label className="block font-medium text-gray-700 ">
              {item.label}
              {item.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {item.category && (
              <p className="text-sm text-gray-500 ">{item.category}</p>
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
            <span className="text-gray-700 ">{item.label}</span>
          </label>
        );
    }
  };

  return (
    <div className="space-y-4">
      {config.map((item) => (
        <div 
          key={item.key} 
          className="p-4 bg-gray-50  rounded-xl border border-gray-200 "
        >
          {renderInputField(item)}
        </div>
      ))}
    </div>
  );
}
