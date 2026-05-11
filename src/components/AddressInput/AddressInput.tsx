import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { geocode, getBrowserLocation, type GeocodeResult } from "../../api/geocode";
import { useDebounce } from "../../hooks/useDebounce";
import { shortAddress } from "../../utils/format";
import { Crosshair, MapPin } from "../icons";
import styles from "./AddressInput.module.css";

interface AddressInputProps {
  onSelect: (result: GeocodeResult) => void;
  busy?: boolean;
}

export function AddressInput({ onSelect, busy }: AddressInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [usingLocation, setUsingLocation] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounced = useDebounce(query, 350);

  useEffect(() => {
    if (debounced.trim().length < 3) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    geocode(debounced)
      .then((r) => {
        if (!cancelled) {
          setResults(r);
          setOpen(true);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSelect = (r: GeocodeResult) => {
    setQuery(shortAddress(r.display_name));
    setOpen(false);
    onSelect(r);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results[0]) handleSelect(results[0]);
  };

  const handleUseLocation = async () => {
    setGeoError(null);
    setUsingLocation(true);
    try {
      const r = await getBrowserLocation();
      setQuery(r.display_name);
      onSelect(r);
    } catch (err) {
      setGeoError(err instanceof Error ? err.message : "Error");
    } finally {
      setUsingLocation(false);
    }
  };

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputWrap}>
          <div className={styles.inputInner}>
            <MapPin size={18} className={styles.icon} strokeWidth={2} />
            <input
              type="text"
              placeholder="Tu dirección, barrio o ciudad…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              disabled={busy}
              autoComplete="off"
            />
            {searching && <div className={styles.spinner} />}
          </div>
        </div>
        <button
          type="submit"
          className={styles.submit}
          disabled={busy || results.length === 0}
        >
          Buscar
        </button>
      </form>

      <button
        type="button"
        className={styles.locateBtn}
        onClick={handleUseLocation}
        disabled={busy || usingLocation}
      >
        {usingLocation ? (
          <>
            <span className={styles.spinnerDark} /> Detectando ubicación…
          </>
        ) : (
          <>
            <Crosshair size={14} strokeWidth={2} /> Usar mi ubicación actual
          </>
        )}
      </button>
      {geoError && <p className={styles.geoError}>{geoError}</p>}

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.ul
            className={styles.dropdown}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {results.map((r, i) => (
              <li key={`${r.lat}-${r.lng}-${i}`}>
                <button type="button" onClick={() => handleSelect(r)}>
                  <MapPin size={16} className={styles.pin} strokeWidth={2} />
                  <span>{r.display_name}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
