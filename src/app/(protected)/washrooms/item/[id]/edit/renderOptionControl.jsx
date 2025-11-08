 const RenderOptionControl = (optionKey, feature) => {
    const currentValue = formData.options[optionKey];

    switch (feature.type) {
      case 'boolean':
        return (
          <div key={optionKey} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <label className="font-medium text-gray-700 dark:text-gray-200">
              {feature.label}
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentValue || false}
                onChange={(e) => handleOptionChange(optionKey, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        );

      case 'select':
        return (
          <div key={optionKey} className="space-y-2">
            <label className="block font-medium text-gray-700 dark:text-gray-200">
              {feature.label}
            </label>
            <select
              value={currentValue || ''}
              onChange={(e) => handleOptionChange(optionKey, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select {feature.label}</option>
              {feature.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return (
          <div key={optionKey} className="space-y-2">
            <label className="block font-medium text-gray-700 dark:text-gray-200">
              {feature.label}
            </label>
            <input
              type="text"
              value={currentValue || ''}
              onChange={(e) => handleOptionChange(optionKey, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Enter ${feature.label}`}
            />
          </div>
        );
    }
  };


  export default  RenderOptionControl;