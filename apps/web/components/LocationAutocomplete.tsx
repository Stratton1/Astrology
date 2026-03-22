'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface GeocodingResult {
  formatted: string;
  lat: number;
  lng: number;
  timezone: string;
}

interface LocationAutocompleteProps {
  value: string;
  onSelect: (result: {
    locationName: string;
    latitude: number;
    longitude: number;
    timezoneId: string;
  }) => void;
  onChange: (value: string) => void;
  error?: string;
  id?: string;
}

/**
 * Location autocomplete using OpenCage Geocoding API.
 * Falls back to manual entry if NEXT_PUBLIC_OPENCAGE_API_KEY is not set.
 */
export function LocationAutocomplete({
  value,
  onSelect,
  onChange,
  error,
  id = 'locationName',
}: LocationAutocompleteProps) {
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const apiKey = process.env['NEXT_PUBLIC_OPENCAGE_API_KEY'];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const search = useCallback(
    async (query: string) => {
      if (!apiKey || query.length < 3) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          query
        )}&key=${apiKey}&limit=5&no_annotations=0`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = (await res.json()) as {
          results: Array<{
            formatted: string;
            geometry: { lat: number; lng: number };
            annotations: { timezone: { name: string } };
          }>;
        };

        setResults(
          data.results.map((r) => ({
            formatted: r.formatted,
            lat: r.geometry.lat,
            lng: r.geometry.lng,
            timezone: r.annotations.timezone.name,
          }))
        );
        setIsOpen(true);
      } catch {
        // Geocoding failed silently — user can still type manually
      } finally {
        setIsSearching(false);
      }
    },
    [apiKey]
  );

  const handleInput = (val: string) => {
    onChange(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 350);
  };

  const handleSelect = (result: GeocodingResult) => {
    onSelect({
      locationName: result.formatted,
      latitude: result.lat,
      longitude: result.lng,
      timezoneId: result.timezone,
    });
    setIsOpen(false);
    setResults([]);
  };

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={id} className="cosmos-label">
        Birth Location <span className="text-cosmos-gold">*</span>
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={
            apiKey
              ? 'Start typing a city name...'
              : 'e.g. New York, NY, USA'
          }
          className="cosmos-input"
          aria-invalid={!!error}
          autoComplete="off"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-4 w-4 text-cosmos-azure"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}

      {!apiKey && (
        <p className="mt-1 text-xs text-cosmos-silver/50">
          Enter coordinates manually below.
          {' '}Set NEXT_PUBLIC_OPENCAGE_API_KEY for autocomplete.
        </p>
      )}

      {/* Dropdown results */}
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-cosmos-deep border border-cosmos-midnight rounded-lg shadow-lg max-h-60 overflow-auto">
          {results.map((result, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => handleSelect(result)}
                className="w-full text-left px-4 py-3 text-sm text-cosmos-mist hover:bg-cosmos-midnight/50 transition-colors border-b border-cosmos-midnight/30 last:border-0"
              >
                <span className="block truncate">{result.formatted}</span>
                <span className="block text-xs text-cosmos-silver/50 mt-0.5">
                  {result.lat.toFixed(4)}, {result.lng.toFixed(4)} &middot;{' '}
                  {result.timezone}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
