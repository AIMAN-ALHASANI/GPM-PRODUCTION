import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * CustomSelect — Modern RTL-compatible dropdown replacing native <select>
 *
 * Props:
 *  - value: current selected value
 *  - onChange: (value) => void
 *  - options: [{ value, label }] or string[]
 *  - placeholder: string (default: 'اختر...')
 *  - searchable: bool — show search input inside dropdown
 *  - disabled: bool
 *  - className: extra wrapper classes
 *  - size: 'sm' | 'md' | 'lg'
 *  - id: string (for accessibility)
 */
const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'اختر...',
  searchable = false,
  disabled = false,
  className = '',
  size = 'md',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  // Normalize options to [{value, label}] format
  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const filteredOptions = searchable && searchQuery
    ? normalizedOptions.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : normalizedOptions;

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || '';

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isOpen, searchable]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  }, [disabled]);

  const handleSelect = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  }[size] || 'px-4 py-2.5 text-sm';

  return (
    <div ref={containerRef} className={`relative select-none ${className}`} dir="rtl">
      {/* Trigger button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`
          w-full flex items-center justify-between gap-2 rounded-xl border transition-all duration-200 font-medium outline-none
          ${sizeClasses}
          ${disabled
            ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed'
            : isOpen
              ? 'bg-white dark:bg-slate-800 border-primary shadow-[0_0_0_3px_rgba(11,132,218,0.15)] text-slate-900 dark:text-white'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary/50 hover:shadow-sm'
          }
        `}
      >
        <span className={displayLabel ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}>
          {displayLabel || placeholder}
        </span>
        <span
          className={`material-symbols-outlined text-lg text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        >
          expand_more
        </span>
      </button>

      {/* Dropdown panel */}
      <div
        className={`
          absolute z-50 w-full mt-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700
          shadow-2xl shadow-slate-300/40 dark:shadow-slate-900/70 overflow-hidden
          transition-all duration-200 origin-top
          ${isOpen
            ? 'opacity-100 scale-y-100 translate-y-0 pointer-events-auto dropdown-enter'
            : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
          }
        `}
        style={{ minWidth: '100%' }}
        role="listbox"
      >
        {/* Search input */}
        {searchable && (
          <div className="p-2 border-b border-slate-100 dark:border-slate-700">
            <div className="relative">
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-base text-slate-400">
                search
              </span>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث..."
                className="w-full pr-9 pl-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        {/* Options list */}
        <div className="max-h-56 overflow-y-auto py-1">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400 text-center">لا توجد نتائج</div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={`
                    w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-right
                    transition-all duration-150 border-r-2
                    ${isSelected
                      ? 'bg-primary/8 text-primary font-semibold border-r-primary'
                      : 'text-slate-700 dark:text-slate-200 border-r-transparent hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:border-r-primary/30 hover:text-primary'
                    }
                  `}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <span className="material-symbols-outlined text-base text-primary flex-shrink-0">
                      check
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomSelect;
