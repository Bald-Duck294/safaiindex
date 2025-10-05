'use client';

export default function LatLongInput({ lat, lng, onChange }) {
  const handleLatChange = (e) => {
    const newLat = parseFloat(e.target.value) || null;
    onChange(newLat, lng);
  };

  const handleLngChange = (e) => {
    const newLng = parseFloat(e.target.value) || null;
    onChange(lat, newLng);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div>
        <label htmlFor="latitude" className="block text-sm font-medium">
          Latitude
        </label>
        <input
          id="latitude"
          type="number"
          step="0.000001"
          value={lat || ''}
          onChange={handleLatChange}
          className="w-full border px-3 py-2 rounded"
          placeholder="Enter latitude"
        />
      </div>
      <div>
        <label htmlFor="longitude" className="block text-sm font-medium">
          Longitude
        </label>
        <input
          id="longitude"
          type="number"
          step="0.000001"
          value={lng || ''}
          onChange={handleLngChange}
          className="w-full border px-3 py-2 rounded"
          placeholder="Enter longitude"
        />
      </div>
    </div>
  );
}