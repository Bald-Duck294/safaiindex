'use client';

import { useEffect, useState } from 'react';
import Select from 'react-select';
import LocationsApi from '@/lib/api/LocationApi';

export default function LocationSearchInput({ value, onChange }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLocations = async (inputValue = '') => {
    setLoading(true);
    try {
      const res = await LocationsApi.getAllLocations();
      const data = res.data || [];

      const filtered = data.filter((loc) =>
        loc.name.toLowerCase().includes(inputValue.toLowerCase())
      );

      const formatted = filtered.map((loc) => ({
        value: loc.id.toString(),
        label: loc.name,
      }));

      setOptions(formatted);
    } catch (err) {
      console.error('Failed to fetch locations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations('');
  }, []);

  return (
    <div>
      <label className="block mb-1 font-medium">Parent Location</label>
      <Select
        isClearable
        isLoading={loading}
        options={options}
        value={options.find((opt) => opt.value === value) || null}
        onInputChange={(inputValue, { action }) => {
          if (action === 'input-change') {
            loadLocations(inputValue || '');
          }
        }}
        onChange={(selected) => onChange(selected?.value || null)}
      />
    </div>
  );
}
