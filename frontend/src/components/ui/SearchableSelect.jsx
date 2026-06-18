import { useState, useRef, useEffect } from 'react';
import './SearchableSelect.css';

export function SearchableSelect({ label, id, value, onChange, options = [], placeholder = 'Seleccionar...', error, required }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find(o => o.value === value);
  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(opt) {
    onChange(opt.value);
    setOpen(false);
    setSearch('');
  }

  function handleToggle() {
    setOpen(prev => !prev);
    if (!open) setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <div className="input-field ss-wrapper" ref={containerRef}>
      {label && (
        <label className="input-label" htmlFor={id}>
          {label}
          {required && <span className="input-required" aria-hidden="true">*</span>}
        </label>
      )}
      <button
        type="button"
        id={id}
        className={`input-control ss-trigger ${error ? 'input-control--error' : ''} ${open ? 'ss-trigger--open' : ''}`}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? '' : 'ss-placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="ss-arrow">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="ss-dropdown" role="listbox">
          <div className="ss-search-wrap">
            <input
              ref={inputRef}
              className="ss-search"
              type="text"
              placeholder="Buscar segmento..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <ul className="ss-list">
            {filtered.length === 0 ? (
              <li className="ss-empty">Sin resultados</li>
            ) : (
              filtered.map(opt => (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={opt.value === value}
                  className={`ss-option ${opt.value === value ? 'ss-option--selected' : ''}`}
                  onMouseDown={() => handleSelect(opt)}
                >
                  {opt.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {error && <span className="input-error" role="alert">{error}</span>}
    </div>
  );
}
