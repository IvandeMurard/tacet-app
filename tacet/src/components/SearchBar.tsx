"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import {
  usePhotonSearch,
  photonFeatureToDisplay,
  photonFeatureToCoords,
  type PhotonFeature,
} from "@/hooks/usePhotonSearch";

const DEBOUNCE_MS = 350;

export interface SearchBarProps {
  onAddressSelect: (lngLat: [number, number]) => void;
}

export function SearchBar({ onAddressSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    } else {
      setDebouncedQuery(null);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const { data, isLoading } = usePhotonSearch(debouncedQuery, DEBOUNCE_MS);
  const suggestions = data?.features ?? [];

  useEffect(() => {
    setIsOpen(suggestions.length > 0);
    setActiveIndex(-1);
  }, [suggestions.length]);

  const handleSelect = useCallback(
    (feature: PhotonFeature) => {
      setQuery(photonFeatureToDisplay(feature));
      setIsOpen(false);
      setActiveIndex(-1);
      onAddressSelect(photonFeatureToCoords(feature));
    },
    [onAddressSelect]
  );

  const handleClear = () => {
    setQuery("");
    setDebouncedQuery(null);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
      return;
    }
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const listboxId = "search-suggestions-listbox";

  return (
    <div
      ref={containerRef}
      className="absolute left-1/2 top-4 z-40 w-[300px] sm:w-[380px] -translate-x-1/2"
      role="search"
      aria-label="Rechercher une adresse à Paris"
    >
      <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-black/65 px-3.5 py-2.5 shadow-2xl backdrop-blur-xl">
        {isLoading ? (
          <Loader2 size={15} className="shrink-0 animate-spin text-white/40" aria-hidden />
        ) : (
          <Search size={15} className="shrink-0 text-white/40" aria-hidden />
        )}
        <input
          role="combobox"
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder="Rechercher une adresse à Paris…"
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
          aria-label="Adresse parisienne"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={activeIndex >= 0 ? `search-option-${activeIndex}` : undefined}
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

      {isOpen && suggestions.length > 0 && (
        <ul
          id={listboxId}
          className="mt-1.5 overflow-hidden rounded-xl border border-white/10 bg-black/70 shadow-2xl backdrop-blur-xl"
          role="listbox"
          aria-label="Suggestions d'adresses"
        >
          {suggestions.map((feature, i) => (
            <li
              key={i}
              id={`search-option-${i}`}
              role="option"
              aria-selected={i === activeIndex}
            >
              <button
                onClick={() => handleSelect(feature)}
                className={`w-full px-4 py-2.5 text-left transition-colors focus:outline-none ${
                  i === activeIndex
                    ? "bg-white/15"
                    : "hover:bg-white/10 focus:bg-white/10"
                }`}
                tabIndex={-1}
              >
                <span className="block text-sm font-medium text-white/90 truncate">
                  {photonFeatureToDisplay(feature)}
                </span>
                {(feature.properties.district || feature.properties.city) && (
                  <span className="block text-xs text-white/40 truncate">
                    {feature.properties.district ?? feature.properties.city}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
