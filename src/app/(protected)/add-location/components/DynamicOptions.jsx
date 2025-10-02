"use client";

export default function DynamicOptions({ config = [], options = {}, setOptions }) {
  const handleChange = (key, value) => {
    setOptions({
      ...options,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4">
      {config.map((item) => (
        <div key={item.key} className="border p-3 rounded">
          <label className="block font-medium mb-2">{item.label}</label>

          {/* RADIO GROUP */}
          {item.type === "radio" && item.options ? (
            <div className="space-y-1">
              {item.options.map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={item.key}
                    value={option}
                    checked={options[item.key] === option}
                    onChange={() => handleChange(item.key, option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          ) : (
            // CHECKBOX for anything else (boolean feature)
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={!!options[item.key]}
                onChange={(e) => handleChange(item.key, e.target.checked)}
              />
              <span>{item.label}</span>
            </label>
          )}
        </div>
      ))}
    </div>
  );
}
