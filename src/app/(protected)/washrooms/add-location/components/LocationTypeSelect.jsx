"use client";

export default function LocationTypeSelect({
  types,
  selectedType,
  setSelectedType,
}) {
  console.log(types, "types");
  return (
    <div className="mt-4">
      <label htmlFor="locationType" className="block text-sm font-medium">
        Location Hirarchy
      </label>
      <select
        id="locationType"
        value={selectedType || ""}
        onChange={(e) => setSelectedType(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      >
        <option value="">Select a location hirarchy</option>
        {types.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>
    </div>
  );
}
