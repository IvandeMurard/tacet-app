"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const GEOCODING_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";
// Bbox Paris : [west, south, east, north]
const PARIS_BBOX = "2.224,48.815,2.470,48.902";

interface GeocodingFeature {
  place_name: string;
  text: string;
  geometry: { coordinates: [number, number] };
}

export interface SearchBarProps {
  onAddressSelect: (lngLat: [number, number]) => void;
}

export function SearchBar({ onAddressSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodingFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Appel API Mapbox Geocoding avec les résultats limités à Paris
  const fetchSuggestions = useCallback(async (q: string) => {
    if (!MAPBOX_TOKEN || q.trim().length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    try {
      const url = new URL(`${GEOCODING_URL}/${encodeURIComponent(q.trim())}.json`);
      url.searchParams.set("access_token", MAPBOX_TOKEN);
      url.searchParams.set("bbox", PARIS_BBOX);
      url.searchParams.set("country", "fr");
      url.searchParams.set("language", "fr");
      url.searchParams.set("types", "address,poi,neighborhood");
      url.searchParams.set("limit", "5");

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`Geocoding error: ${res.status}`);
      const data = await res.json();
      const features: GeocodingFeature[] = data.features ?? [];
      setSuggestions(features);
      setIsOpen(features.length > 0);
    } catch {
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length >= 3) {
      debounceRef.current = setTimeout(() => fetchSuggestions(val), 350);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelect = useCallback(
    (feature: GeocodingFeature) => {
      setQuery(feature.place_name);
      setIsOpen(false);
      setSuggestions([]);
      onAddressSelect(feature.geometry.coordinates);
    },
    [onAddressSelect]
  );

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Fermeture au clic en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Nettoyage debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Formatage du sous-titre de suggestion (adresse sans le nom principal)
  const formatSubtitle = (feature: GeocodingFeature) => {
    const subtitle = feature.place_name.replace(feature.text, "").replace(/^[,\s]+/, "");
    return subtitle || null;
  };

  return (
    <div
      ref={containerRef}
      className="absolute left-1/2 top-4 z-40 w-[300px] sm:w-[380px] -translate-x-1/2"
      role="search"
      aria-label="Rechercher une adresse à Paris"
    >
      {/* Champ de saisie */}
      <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-black/65 px-3.5 py-2.5 shadow-2xl backdrop-blur-xl">
        {isLoading ? (
          <Loader2 size={15} className="shrink-0 animate-spin text-white/40" aria-hidden />
        ) : (
          <Search size={15} className="shrink-0 text-white/40" aria-hidden />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder="Rechercher une adresse à Paris…"
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
          aria-label="Adresse parisienne"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          autoComplete="off"
          spellCheck={false}
        />
        {query.length > 0 && (
          <button
            onClick={handleClear}
            className="shrink-0 rounded-full p-0.5 text-white/30 transition-colors hover:text-white/70"
            aria-label="Effacer la recherche"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Suggestions */}
      {isOpen && suggestions.length > 0 && (
        <ul
          className="mt-1.5 overflow-hidden rounded-xl border border-white/10 bg-black/70 shadow-2xl backdrop-blur-xl"
          role="listbox"
          aria-label="Suggestions d'adresses"
        >
          {suggestions.map((feature, i) => {
            const subtitle = formatSubtitle(feature);
            return (
              <li key={i} role="option" aria-selected={false}>
                <button
                  onClick={() => handleSelect(feature)}
                  className="w-full px-4 py-2.5 text-left transition-colors hover:bg-white/10 focus:bg-white/10 focus:outline-none"
                >
                  <span className="block text-sm font-medium text-white/90 truncate">
                    {feature.text}
                  </span>
                  {subtitle && (
                    <span className="block text-xs text-white/40 truncate">{subtitle}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
